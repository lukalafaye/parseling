import streamlit as st
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import joblib
import os
import shutil
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix
from concrete.ml.sklearn.tree import DecisionTreeClassifier as FHEDecisionTreeClassifier
from concrete.ml.deployment import FHEModelDev, FHEModelClient, FHEModelServer

# Define the directory for FHE client/server files
fhe_directory = '/tmp/fhe_client_server_files/'

# Create the directory if it does not exist
if not os.path.exists(fhe_directory):
    os.makedirs(fhe_directory)
else:
    # If it exists, delete its contents
    shutil.rmtree(fhe_directory)
    os.makedirs(fhe_directory)

# Load the data
data = pd.read_csv('data/heart.xls')

st.write("### Data Overview")
st.write(data.head())
data.info()  # Show info in the Streamlit app

# Correlation analysis
data_corr = data.corr()
plt.figure(figsize=(20, 20))
sns.heatmap(data=data_corr, annot=True)
st.write("### Correlation Heatmap")
st.pyplot(plt)

feature_value = np.array(data_corr['output'])
for i in range(len(feature_value)):
    if feature_value[i] < 0:
        feature_value[i] = -feature_value[i]

features_corr = pd.DataFrame(feature_value, index=data_corr['output'].index, columns=['correlation'])
feature_sorted = features_corr.sort_values(by=['correlation'], ascending=False)
feature_selected = feature_sorted.index

st.write("### Selected Features")
st.write(feature_selected)

# Clean the data by selecting the most correlated features
clean_data = data[feature_selected]

# Prepare the dataset for training
X = clean_data.iloc[:, 1:]
Y = clean_data['output']
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size=0.25, random_state=0)

st.write("### Training Data Shape")
st.write(f"X Train Shape: {x_train.shape}, Y Train Shape: {y_train.shape}")
st.write(f"X Test Shape: {x_test.shape}, Y Test Shape: {y_test.shape}")

# Feature scaling
sc = StandardScaler()
x_train = sc.fit_transform(x_train)
x_test = sc.transform(x_test)

# Train the model
dt = DecisionTreeClassifier(criterion='entropy', max_depth=6)
dt.fit(x_train, y_train)

# Predict and evaluate
y_pred = dt.predict(x_test)
conf_mat = confusion_matrix(y_test, y_pred)
accuracy = dt.score(x_test, y_test)

st.write("### Confusion Matrix")
st.write(conf_mat)
st.write(f"### Accuracy: {round(accuracy * 100, 2)}%")

# Save the model
joblib.dump(dt, 'heart_disease_dt_model.pkl')

# Convert the model for FHE
st.write("#### Converting the model for FHE...")
fhe_compatible = FHEDecisionTreeClassifier.from_sklearn_model(dt, x_train, n_bits=10)
fhe_compatible.compile(x_train)

# Setup the server
st.write("#### Setting up the FHE server...")
dev = FHEModelDev(path_dir=fhe_directory, model=fhe_compatible)
dev.save()
server = FHEModelServer(path_dir=fhe_directory)
server.load()
st.success("Done!")

# Setup the client
st.write("#### Setting up the FHE client...")
client = FHEModelClient(path_dir=fhe_directory, key_dir="/tmp/keys_client")
serialized_evaluation_keys = client.get_serialized_evaluation_keys()
st.success("Done!")

st.write("#### Loading the dataset and encrypting relevant features for prediction...")
# Load the dataset and select the relevant features for prediction
sample_data = clean_data.iloc[0, 1:].values.reshape(1, -1)  # First sample for prediction
encrypted_data = client.quantize_encrypt_serialize(sample_data)
st.success("Done!")

st.write("##### Running the server with encrypted data...")
# Run the server with encrypted data
encrypted_result = server.run(encrypted_data, serialized_evaluation_keys)
st.success("Done!")

st.write("#### Decrypting the prediction result...")
result = client.deserialize_decrypt_dequantize(encrypted_result)
st.success("Done!")

st.write("#### Encrypted Prediction Result")
if result.any():
    st.markdown("<h1 style='color:red;'>Prediction: The patient is likely to have heart disease.</h1>", unsafe_allow_html=True)
else:
    st.markdown("<h1 style='color:red;'>Prediction: The patient is unlikely to have heart disease.</h1>", unsafe_allow_html=True)
