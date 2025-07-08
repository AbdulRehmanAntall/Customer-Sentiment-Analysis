from flask import Flask
from flask_cors import CORS
from routes.api_routes import api

app = Flask(__name__)
CORS(app)

# Register Blueprint
app.register_blueprint(api, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
