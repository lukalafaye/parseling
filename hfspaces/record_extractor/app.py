import streamlit as st
import requests
from PIL import Image
import pytesseract
import os
from langchain_huggingface import HuggingFaceEndpoint
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
import re
import json

# Set up the Hugging Face API key
api_key = os.environ.get("HFBearer")
os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_key

# API URL and headers
API_URL = "https://pllfc7e5i0rujahy.us-east-1.aws.endpoints.huggingface.cloud"

# Function to extract text from image
def extract_text_from_image(image):
    return pytesseract.image_to_string(image)

# Function to extract JSON from text
def extract_json(text):
    match = re.search(r'<JSON>\s*(.*?)\s*</JSON>', text, re.DOTALL)
    if match:
        json_str = match.group(1)  
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return "Error decoding JSON"
    return "No JSON found"

# Function to get metadata title from image
def get_image_metadata(image):
    return image.name.split('.')[0]

def count_tokens(text):
    return len(text.split())

# Mapping of image parameters to expected fields
image_params = {
    "bilan-atherosclerose": "medecin_responsable, rythme_sinusal, valeur_EIM, score_calcique",
    "bilan-medical": "medecin_responsable, date_naissance, prenom, nom, identifiant_patient, nom_medecin",
    "ECG": "medecin_responsable, poids, taille, ECG_repos_valeur_par_minute, valeur_FMT, valeur_niveau_atteint, valeur_diminution_frequence_cardiaque_bpm",
    "echo-doppler": "medecin_responsable, sous_clavieres, vertebrales, carotides",
    "echographie-poumons": "medecin_responsable, score calcique, technique, resultats",
    "echotomographie-abdominale": "medecin_responsable, foie, vesicule, pancreas, reins, rate, aorte_abdominale, conclusion",
    "echotomographie-cardiaque": "medecin_responsable, taille, poids, surface_corporelle, conclusion",
    "echotomographie-prostate": "medecin_responsable, vessie, ureteres, prostate, conclusion",
    "hematologie": "medecin_responsable, leucocytes, hematies, hemoglobines, hematocrite"
}

# Streamlit app layout
st.title("Medical Patient Data Extractor")
st.write("This app extracts medical patient data from uploaded images.")

# User prompt template
user_input = """
You will extract parameters from a text inside a JSON object, written between <JSON> and </JSON>.
List of parameters: {parameters}

Here is an example of a valid response:
<JSON>
{{"date_naissance": "", "prenom": "", "nom": ""}}
</JSON>

Here is the text from which you need to extract the parameters:
{texte}
"""
prompt = PromptTemplate.from_template(user_input)

# Initialize Hugging Face LLM
llm = HuggingFaceEndpoint(endpoint_url=API_URL)
llm_chain = prompt | llm

# File uploader for multiple images
uploaded_images = st.file_uploader("Upload images", type=["png", "jpg", "jpeg"], accept_multiple_files=True)

if st.button("Submit"):
    if uploaded_images:
        all_json_data = {}  # Dictionary to store JSON data for each image
        for uploaded_image in uploaded_images:
            with st.spinner(f"Extracting text from image: {uploaded_image.name}..."):
                image = Image.open(uploaded_image)
                
                # Display the uploaded image
                st.image(image, caption=f"Uploaded Image: {uploaded_image.name}", use_column_width=True)

                extracted_text = extract_text_from_image(image)
                st.text_area(f"Extracted Text from {uploaded_image.name}", value=extracted_text, height=200, key=f"{uploaded_image.name}")

                max_text_length = 500  # Adjust as needed
                if count_tokens(extracted_text) > max_text_length:
                    extracted_text = " ".join(extracted_text.split()[:max_text_length])

                title = get_image_metadata(uploaded_image)
                parameters = image_params.get(title, "Unknown parameters")

                with st.spinner(f"Fetching response from API for {uploaded_image.name}..."):
                    output = llm_chain.invoke({"texte": extracted_text, "parameters": parameters})
                    st.success(f"Response received for {uploaded_image.name}!")

                    # Extract JSON from the API output
                    json_data = extract_json(output)
                    all_json_data[title] = json_data
                    st.write(f"**{title} JSON Data:**")
                    st.json(json_data)  # Display JSON nicely
        st.write("All extracted JSON Data:")
        st.json(all_json_data)  # Display all extracted JSON data together
    else:
        st.warning("Please upload at least one image to extract text.")