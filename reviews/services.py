from ai_engine.services import ReviewAnalysisService

def analyze_review_text(text):
    """
    Calls the AI engine to analyze the review text.
    """
    return ReviewAnalysisService().analyse(text)
