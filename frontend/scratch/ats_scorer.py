import re
import math
from collections import Counter

def tokenize(text):
    """
    Cleans and tokenizes text, removing stop words.
    """
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    tokens = [w for w in text.split() if len(w) > 2]
    
    # Common English stop words
    stop_words = {'and', 'the', 'for', 'with', 'this', 'that', 'you', 'are', 'your', 'can', 'will', 'have', 'from', 'but', 'not', 'our', 'what', 'we', 'experience', 'ability', 'strong', 'skills'}
    
    return [w for w in tokens if w not in stop_words]

def compute_tf(tokens):
    """
    Computes Term Frequency for a list of tokens.
    """
    token_counts = Counter(tokens)
    total_tokens = len(tokens)
    tf_dict = {}
    for token, count in token_counts.items():
        tf_dict[token] = count / float(total_tokens)
    return tf_dict

def calculate_cosine_similarity(resume_text, jd_text):
    """
    Calculates the cosine similarity between a Resume and Job Description using TF.
    """
    resume_tokens = tokenize(resume_text)
    jd_tokens = tokenize(jd_text)
    
    resume_tf = compute_tf(resume_tokens)
    jd_tf = compute_tf(jd_tokens)
    
    # All unique words across both documents
    all_words = set(resume_tokens).union(set(jd_tokens))
    
    dot_product = 0.0
    mag_resume = 0.0
    mag_jd = 0.0
    
    for word in all_words:
        val_resume = resume_tf.get(word, 0.0)
        val_jd = jd_tf.get(word, 0.0)
        
        dot_product += (val_resume * val_jd)
        mag_resume += (val_resume * val_resume)
        mag_jd += (val_jd * val_jd)
        
    mag_resume = math.sqrt(mag_resume)
    mag_jd = math.sqrt(mag_jd)
    
    if mag_resume == 0 or mag_jd == 0:
        return 0.0
    
    similarity = dot_product / (mag_resume * mag_jd)
    return similarity

def find_missing_keywords(resume_text, jd_text, top_n=10):
    """
    Identifies the most frequent words in the JD that are completely missing from the Resume.
    """
    resume_tokens = set(tokenize(resume_text))
    jd_tokens = tokenize(jd_text)
    
    jd_counts = Counter(jd_tokens)
    
    missing_words = []
    for word, count in jd_counts.most_common():
        if word not in resume_tokens:
            missing_words.append(word)
        if len(missing_words) >= top_n:
            break
            
    return missing_words

if __name__ == "__main__":
    # Test Data
    sample_jd = "We are looking for a Software Engineer with strong experience in Python, React, and AWS. The candidate must have knowledge of machine learning algorithms and Git version control."
    sample_resume = "I am a developer with 3 years of experience building web applications using Javascript, React, and Node.js. I have used Git for version control."
    
    # 1. Calculate Score
    similarity_score = calculate_cosine_similarity(sample_resume, sample_jd)
    match_percentage = min(100, round((similarity_score * 100) * 1.5)) # Boosted for realism
    
    # 2. Extract Missing Keywords
    missing_keys = find_missing_keywords(sample_resume, sample_jd)
    
    print("=== ATS MATCH RESULTS ===")
    print(f"Match Score: {match_percentage}%")
    print(f"Missing Keywords to add: {', '.join(missing_keys)}")
