from flask import Flask, Response, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token
import pandas as pd
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit
from sklearn.metrics import r2_score

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
db = SQLAlchemy(app)

# Configure JWT
jwt = JWTManager(app)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __init__(self, first_name, last_name, email, password):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = generate_password_hash(password)

# Create the database tables
with app.app_context():
    db.create_all()
    
@app.route('/')
def hello_world():
    return 'Welcome to the Flask API for Sales Prediction Forecasting'

# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists'})

    # Create a new user
    user = User(first_name=first_name, last_name=last_name, email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Query the user from the database
    user = User.query.filter_by(email=email).first()

    # Check if the user exists and the password is correct
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/users', methods=['GET'])
#@jwt_required()
def get_users():
    users = User.query.all()
    user_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'password': user.password
        }
        user_list.append(user_data)

    return jsonify(user_list)

from flask import Flask, jsonify, request

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file.filename == '':
        return 'No file selected'
    
    # Save the file to a desired location
    file.save('file.filename')
    print('File saved Successfully')
    
    periodicity = request.form['periodicity']
    periods = int(request.form['periods'])

    df = pd.read_csv(file.filename, encoding='UTF-8')

    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['Sales'] = df['Quantity'] * df['UnitPrice']
    df = df.groupby(pd.Grouper(key='InvoiceDate', freq=periodicity)).agg({'Sales': 'sum'}).reset_index()

    df['InvoiceDate'].fillna(-1, inplace=True)
    train_data = df.iloc[:-periods, :]
    test_data = df.iloc[-periods:, :]

    train_data['day_of_week'] = train_data['InvoiceDate'].dt.dayofweek
    train_data['day_of_year'] = train_data['InvoiceDate'].dt.day_of_year
    train_data['month'] = train_data['InvoiceDate'].dt.month
    train_data['quarter'] = train_data['InvoiceDate'].dt.quarter

    model = RandomForestRegressor(random_state=42)

    param_grid = {
        'n_estimators': [10, 50, 100],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }

    tscv = TimeSeriesSplit(n_splits=5)

    grid_search = GridSearchCV(model, param_grid, cv=tscv, scoring='neg_mean_squared_error')
    grid_search.fit(train_data[['day_of_week', 'day_of_year', 'month', 'quarter']], train_data['Sales'])

    test_data['day_of_week'] = test_data['InvoiceDate'].dt.dayofweek
    test_data['day_of_year'] = test_data['InvoiceDate'].dt.day_of_year
    test_data['month'] = test_data['InvoiceDate'].dt.month
    test_data['quarter'] = test_data['InvoiceDate'].dt.quarter

    y_pred = grid_search.predict(test_data[['day_of_week', 'day_of_year', 'month', 'quarter']])

    r2 = r2_score(test_data['Sales'], y_pred)

    pred_sales = pd.DataFrame({'Sales': y_pred})
    pred_sales.index = pd.date_range(start=train_data['InvoiceDate'].max() + pd.Timedelta(days=1), periods=periods, freq=periodicity)

    output = pred_sales.to_csv(header=True)

    return Response(
        f'R2 Score: {r2}\n' + output,
        mimetype="text/csv",
        headers={"Content-disposition":
                 "attachment; filename=predicted_sales.csv"})
    
if __name__ == '__main__':
    app.run()
