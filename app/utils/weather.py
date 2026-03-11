"""
Weather Utility Module
----------------------

Handles seasonal classification logic.

Phase-1 (SRS):
We simulate seasonal context based on month.

Future versions:
- Integrate Open-Meteo API
- Add temperature thresholds
- Add rain probability impact
"""


def get_season(month: int) -> str:
    """
    Returns season category based on month.

    Cold  : Dec, Jan, Feb
    Hot   : Jun, Jul, Aug
    Mild  : Mar, Apr, May, Sep, Oct, Nov
    """

    if month in [12, 1, 2]:
        return "Cold"

    elif month in [6, 7, 8]:
        return "Hot"

    elif month in [3, 4, 5, 9, 10, 11]:
        return "Mild"

    else:
        raise ValueError("Month must be between 1 and 12.")
