from pathlib import Path
import pickle

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

# Dados simulados para o modelo de ML. Em producao, esta origem deve vir da base real.
data = {
    "idade_vitima": [20, 30, 40, 25, 35, 45, 50, 22, 33, 42],
    "genero_vitima": [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    "local_crime": [1, 2, 1, 3, 2, 1, 3, 2, 1, 3],
    "tipo_crime": [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
}

df = pd.DataFrame(data)

X = df[["idade_vitima", "genero_vitima", "local_crime"]]
y = df["tipo_crime"]

X_train, _, y_train, _ = train_test_split(X, y, test_size=0.3, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

with MODEL_PATH.open("wb") as file:
    pickle.dump(model, file)

print(f"Modelo treinado e salvo em {MODEL_PATH}")
