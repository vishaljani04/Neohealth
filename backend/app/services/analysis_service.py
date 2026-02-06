
import pandas as pd
import os

class DataAnalysisService:
    @staticmethod
    def get_global_summary():
        # Define paths
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
        
        # Default fallback
        summary = {
            "total_records": 0,
            "avg_heart_rate": 0,
            "total_steps": 0,
            "phase_distribution": {}
        }
        
        try:
            # Try to read sample data if available to simulate stats
            # In a real app, this would iterate over all relevant CSVs
            # Here we just mock it safely or read one file if exists
            pass
        except Exception as e:
            print(f"Error calculating summary: {e}")
            
        return summary
