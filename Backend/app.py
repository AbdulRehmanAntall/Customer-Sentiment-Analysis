from flask import Flask
from flask_cors import CORS
from routes.api_routes import api
from routes.insert_routes import insert
from sentiment.sentiment import sentiment
app = Flask(__name__)
CORS(app)

# Register Blueprint
app.register_blueprint(api, url_prefix="/api")
app.register_blueprint(insert,url_prefix="/insert")
app.register_blueprint(sentiment,url_prefix="/sentiment")
if __name__ == "__main__":
    app.run(debug=True, port=5000)
