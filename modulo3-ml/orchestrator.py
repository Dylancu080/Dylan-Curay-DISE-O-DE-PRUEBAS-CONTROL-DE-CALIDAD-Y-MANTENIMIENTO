import itertools
import random
import json
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

FACTORES = {
    "Navegador": ["Chrome", "Firefox", "Safari", "Edge", "Brave"],
    "Sistema_Operativo": ["Windows", "macOS", "Linux"],
    "Tipo_Usuario": ["Admin", "Guest", "Premium", "Free"],
    "Tipo_Suscripcion": ["Gratuito", "Basico", "Pro", "Enterprise"],
    "Metodo_Pago": ["Tarjeta_Credito", "PayPal", "Cripto", "Transferencia"],
}

NOMBRES_COLUMNAS = list(FACTORES.keys())


def generar_combinaciones(factores: dict) -> pd.DataFrame:
    valores = list(factores.values())
    combinaciones = list(itertools.product(*valores))
    df = pd.DataFrame(combinaciones, columns=list(factores.keys()))
    print(f"[1/4] Combinaciones totales generadas: {len(df)}")
    return df


def calcular_riesgo_base(row: pd.Series) -> float:
    prob = 0.10

    if row["Metodo_Pago"] == "Cripto":
        prob += 0.25
    if row["Tipo_Suscripcion"] == "Enterprise":
        prob += 0.15
    if row["Navegador"] == "Safari" and row["Sistema_Operativo"] == "macOS":
        prob += 0.12
    if row["Tipo_Usuario"] == "Guest":
        prob += 0.18
    if row["Navegador"] == "Brave":
        prob += 0.08
    if row["Tipo_Usuario"] == "Admin" and row["Tipo_Suscripcion"] == "Pro":
        prob -= 0.08
    if row["Navegador"] == "Chrome" and row["Sistema_Operativo"] == "Windows":
        prob -= 0.05

    return min(max(prob, 0.02), 0.98)


def generar_dataset_historico(df_combinaciones: pd.DataFrame, n_muestras: int = 800) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)

    indices = np.random.choice(len(df_combinaciones), size=n_muestras, replace=True)
    df_hist = df_combinaciones.iloc[indices].copy().reset_index(drop=True)

    etiquetas = []
    for _, row in df_hist.iterrows():
        prob = calcular_riesgo_base(row)
        etiqueta = 1 if random.random() < prob else 0
        etiquetas.append(etiqueta)

    df_hist["resultado"] = etiquetas
    fallos = sum(etiquetas)
    print(
        f"[2/4] Dataset historico: {n_muestras} muestras | "
        f"{fallos} fallos ({fallos / n_muestras * 100:.1f}%) | "
        f"{n_muestras - fallos} exitos"
    )
    return df_hist


def entrenar_modelo(df_hist: pd.DataFrame):
    encoders = {}
    df_encoded = df_hist.copy()

    for col in NOMBRES_COLUMNAS:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_hist[col])
        encoders[col] = le

    X = df_encoded[NOMBRES_COLUMNAS].values
    y = df_encoded["resultado"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n[3/4] Modelo entrenado - Accuracy en test: {acc * 100:.1f}%")
    print("\nReporte de clasificacion:")
    print(classification_report(y_test, y_pred, target_names=["Exito (0)", "Fallo (1)"]))

    importancias = sorted(
        zip(NOMBRES_COLUMNAS, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    print("Importancia de factores:")
    for nombre, imp in importancias:
        barra = "#" * int(imp * 40)
        print(f"  {nombre:25s} {barra} {imp * 100:.1f}%")

    return model, encoders


NIVELES_RIESGO = [
    (0.75, "CRITICO"),
    (0.50, "ALTO"),
    (0.30, "MEDIO"),
    (0.00, "BAJO"),
]


def nivel_riesgo(prob: float) -> str:
    for umbral, etiqueta in NIVELES_RIESGO:
        if prob >= umbral:
            return etiqueta
    return "BAJO"


def predecir_y_reportar(model, encoders: dict, df_combinaciones: pd.DataFrame, top_n: int = 30):
    df_pred = df_combinaciones.copy()

    for col in NOMBRES_COLUMNAS:
        le = encoders[col]
        known = set(le.classes_)
        df_pred[col + "_enc"] = df_pred[col].apply(
            lambda v: le.transform([v])[0] if v in known else -1
        )

    enc_cols = [c + "_enc" for c in NOMBRES_COLUMNAS]
    X_new = df_pred[enc_cols].values
    probs = model.predict_proba(X_new)[:, 1]

    df_pred["prob_fallo"] = probs
    df_pred["nivel_riesgo"] = df_pred["prob_fallo"].apply(nivel_riesgo)
    df_pred = df_pred.sort_values("prob_fallo", ascending=False).reset_index(drop=True)

    print(f"\n[4/4] Top {top_n} combinaciones de mayor riesgo:\n")
    top = df_pred.head(top_n)

    header = (
        f"{'#':>3} | {'Navegador':10} | {'SO':8} | {'Usuario':10} | "
        f"{'Suscripcion':12} | {'Pago':17} | {'Prob%':6} | Nivel"
    )
    print(header)
    print("-" * len(header))

    for i, row in top.iterrows():
        print(
            f"{i + 1:>3} | {row['Navegador']:10} | {row['Sistema_Operativo']:8} | "
            f"{row['Tipo_Usuario']:10} | {row['Tipo_Suscripcion']:12} | "
            f"{row['Metodo_Pago']:17} | {row['prob_fallo'] * 100:5.1f}% | {row['nivel_riesgo']}"
        )

    reporte = {
        "generado_en": datetime.now().isoformat(),
        "total_combinaciones": len(df_combinaciones),
        "top_riesgo": top[NOMBRES_COLUMNAS + ["prob_fallo", "nivel_riesgo"]].to_dict(
            orient="records"
        ),
    }
    with open("reporte_riesgo.json", "w", encoding="utf-8") as f:
        json.dump(reporte, f, ensure_ascii=False, indent=2)

    print("\n  Reporte guardado en: reporte_riesgo.json")
    return df_pred


if __name__ == "__main__":
    print("=" * 60)
    print("  ORQUESTADOR COMBINATORIO + ML")
    print("=" * 60 + "\n")

    df_combinaciones = generar_combinaciones(FACTORES)
    df_historico = generar_dataset_historico(df_combinaciones, n_muestras=1000)
    model, encoders = entrenar_modelo(df_historico)
    predecir_y_reportar(model, encoders, df_combinaciones, top_n=30)

    print("\n  Ejecucion completada.")
    print("=" * 60)
