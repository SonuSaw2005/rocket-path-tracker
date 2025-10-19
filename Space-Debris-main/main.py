from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
import math
import random

# ---------------------------
# Initialize FastAPI
# ---------------------------
app = FastAPI()

# ---------------------------
# Enable CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict to frontend origin later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Input Model
# ---------------------------
class LaunchParams(BaseModel):
    site: str
    velocity: float
    angle: float  # degrees
    orbit: str

# ---------------------------
# Helper Functions
# ---------------------------
def simulate_trajectory(velocity: float, angle: float) -> List[Dict]:
    """
    Generates a simple parabolic trajectory with extra details
    like speed and fuel percentage at each time step.
    """
    trajectory = []
    rad_angle = math.radians(angle)
    g = 9.8  # gravity

    fuel = 100  # start with full fuel

    for t in range(0, 101, 10):
        x = velocity * math.cos(rad_angle) * t
        y = velocity * math.sin(rad_angle) * t - 0.5 * g * t**2
        y = max(y, 0)

        # compute speed at time t
        vx = velocity * math.cos(rad_angle)
        vy = velocity * math.sin(rad_angle) - g * t
        speed = math.sqrt(vx**2 + vy**2)

        # decrease fuel (linear for simplicity)
        fuel = max(0, 100 - t)

        # add a random z-axis deviation
        z = random.uniform(-50, 50)

        trajectory.append({
            "time": t,
            "x": round(x, 2),
            "y": round(y, 2),
            "z": round(z, 2),
            "speed": round(speed, 2),
            "fuel": fuel
        })
    return trajectory

def detect_debris(num_debris: int = 5) -> List[Dict]:
    debris_list = []
    for i in range(num_debris):
        debris_list.append({
            "id": f"DEBRIS-{i+1}",
            "x": random.randint(-500, 500),
            "y": random.randint(0, 800),
            "z": random.randint(-300, 300),
            "risk": random.choice(["safe", "caution", "risky"])
        })
    return debris_list

def evaluate_risk(debris_objects: List[Dict]) -> str:
    if any(d["risk"] == "risky" for d in debris_objects):
        return "risky"
    elif any(d["risk"] == "caution" for d in debris_objects):
        return "caution"
    return "safe"

# ---------------------------
# API Endpoints
# ---------------------------
@app.post("/simulate")
def simulate(params: LaunchParams):
    rocket_path = simulate_trajectory(params.velocity, params.angle)
    debris_objects = detect_debris(num_debris=5)
    risk_level = evaluate_risk(debris_objects)

    # compute max altitude and final distance for summary
    max_altitude = max(p["y"] for p in rocket_path)
    final_distance = rocket_path[-1]["x"]

    return {
        "site": params.site,
        "orbit": params.orbit,
        "trajectory": rocket_path,
        "debris": debris_objects,
        "risk": risk_level,
        "summary": {
            "max_altitude": round(max_altitude, 2),
            "final_distance": round(final_distance, 2)
        }
    }

@app.get("/")
def home():
    return {"message": "Space Debris API is running 🚀"}
