from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://forescan-d1k1.vercel.app",
]

allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", ",".join(DEFAULT_ALLOWED_ORIGINS)).split(",")
    if origin.strip()
]

CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Conexão com MongoDB
try:
    # Para um ambiente real, use uma string de conexão MongoDB Atlas ou um servidor MongoDB local
    # client = MongoClient("mongodb+srv://username:password@cluster.mongodb.net/")
    # Como estamos em um ambiente de desenvolvimento, vamos simular o banco de dados com variáveis
    print("Simulando conexão com MongoDB...")
    db_connected = True
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    db_connected = False

# Carregar o modelo de ML
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    model_loaded = True
    print("Modelo carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o modelo: {e}")
    model_loaded = False

# Dados simulados para o banco de dados
casos = [
    {
        "id": "1",
        "titulo": "Furto em residência",
        "descricao": "Furto de eletrônicos em residência",
        "data_ocorrencia": "2025-05-01",
        "local": "Rua A, 123",
        "tipo_crime": "Furto",
        "idade_vitima": 35,
        "genero_vitima": "Masculino",
        "local_crime": 1  # 1 para residência
    },
    {
        "id": "2",
        "titulo": "Roubo de celular",
        "descricao": "Roubo de celular com ameaça",
        "data_ocorrencia": "2025-05-15",
        "local": "Avenida B, 456",
        "tipo_crime": "Roubo",
        "idade_vitima": 25,
        "genero_vitima": "Feminino",
        "local_crime": 2  # 2 para via pública
    }
]

# Rota inicial
@app.route('/')
def hello():
    return "Bem-vindo à API de análise de casos criminais"

# Endpoints CRUD para casos
@app.route('/api/casos', methods=['GET'])
def get_casos():
    return jsonify({"casos": casos})

@app.route('/api/casos/<id>', methods=['GET'])
def get_caso(id):
    caso = next((c for c in casos if c["id"] == id), None)
    if caso:
        return jsonify({"caso": caso})
    return jsonify({"erro": "Caso não encontrado"}), 404

@app.route('/api/casos', methods=['POST'])
def add_caso():
    novo_caso = request.json
    # Gerar ID simples (em um ambiente real, o MongoDB geraria o ID)
    novo_caso["id"] = str(len(casos) + 1)
    casos.append(novo_caso)
    return jsonify({"caso": novo_caso}), 201

@app.route('/api/casos/<id>', methods=['PUT'])
def update_caso(id):
    caso = next((c for c in casos if c["id"] == id), None)
    if not caso:
        return jsonify({"erro": "Caso não encontrado"}), 404
    
    dados_atualizados = request.json
    for key, value in dados_atualizados.items():
        caso[key] = value
    
    return jsonify({"caso": caso})

@app.route('/api/casos/<id>', methods=['DELETE'])
def delete_caso(id):
    global casos
    caso = next((c for c in casos if c["id"] == id), None)
    if not caso:
        return jsonify({"erro": "Caso não encontrado"}), 404
    
    casos = [c for c in casos if c["id"] != id]
    return jsonify({"mensagem": "Caso excluído com sucesso"})

# Endpoints para o modelo de ML
@app.route('/api/predict', methods=['POST'])
def predict():
    if not model_loaded:
        return jsonify({"erro": "Modelo não carregado"}), 500
    
    data = request.json
    try:
        # Preparar os dados para predição
        input_data = pd.DataFrame({
            'idade_vitima': [data.get('idade_vitima', 0)],
            'genero_vitima': [1 if data.get('genero_vitima') == 'Feminino' else 0],
            'local_crime': [data.get('local_crime', 0)]
        })
        
        # Fazer a predição
        prediction = model.predict(input_data)[0]
        prediction_proba = model.predict_proba(input_data)[0].tolist()
        
        # Mapear a predição para o tipo de crime
        tipo_crime = "Roubo" if prediction == 1 else "Furto"
        
        return jsonify({
            "prediction": int(prediction),
            "tipo_crime": tipo_crime,
            "probabilidade": prediction_proba
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

@app.route('/api/model/features', methods=['GET'])
def get_feature_importance():
    if not model_loaded:
        return jsonify({"erro": "Modelo não carregado"}), 500
    
    try:
        # Obter a importância das features
        feature_importance = model.coef_[0].tolist()
        features = ['idade_vitima', 'genero_vitima', 'local_crime']
        
        # Criar um dicionário com as features e suas importâncias
        importance_dict = {features[i]: abs(feature_importance[i]) for i in range(len(features))}
        
        # Ordenar por importância
        sorted_importance = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            "feature_importance": [{"feature": k, "importance": v} for k, v in sorted_importance]
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

@app.route('/api/estatisticas', methods=['GET'])
def get_estatisticas():
    # Estatísticas simuladas
    estatisticas = {
        "total_casos": len(casos),
        "por_tipo": {
            "Furto": sum(1 for c in casos if c["tipo_crime"] == "Furto"),
            "Roubo": sum(1 for c in casos if c["tipo_crime"] == "Roubo")
        },
        "por_local": {
            "Residência": sum(1 for c in casos if c["local_crime"] == 1),
            "Via Pública": sum(1 for c in casos if c["local_crime"] == 2),
            "Comércio": sum(1 for c in casos if c["local_crime"] == 3)
        },
        "por_genero": {
            "Masculino": sum(1 for c in casos if c["genero_vitima"] == "Masculino"),
            "Feminino": sum(1 for c in casos if c["genero_vitima"] == "Feminino")
        }
    }
    return jsonify(estatisticas)

def run_dev_server():
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(debug=debug_mode, host=host, port=port)


if __name__ == '__main__':
    run_dev_server()
