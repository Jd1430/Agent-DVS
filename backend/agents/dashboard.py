# backend/agents/dashboard.py

class Dashboard:
    """Prepares dashboard-ready visualizations for external rendering."""

    def display_dashboard(self, visualizations):
        """Returns visualization JSONs for React-based frontend (no Streamlit)."""
        return visualizations  # Already Plotly-compatible dicts
