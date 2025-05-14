from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from transformers import pipeline
import os
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="Student Analytics Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the LLM pipeline
model_name = os.getenv("MODEL_NAME", "facebook/bart-large-cnn")
summarizer = pipeline("summarization", model=model_name)

# Sample data model
class Student(BaseModel):
    id: int
    name: str
    grade: float
    attendance: float
    subjects: List[str]
    performance_metrics: dict
    last_updated: str

def generate_student_data(num_students=100):
    first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
                  "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                 "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English Literature", "History", "Geography", "Computer Science"]
    
    students = []
    for i in range(1, num_students + 1):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        grade = round(random.uniform(60, 100), 1)
        attendance = round(random.uniform(75, 100), 1)
        student_subjects = random.sample(subjects, 4)
        
        # Generate realistic performance metrics
        homework_completion = round(random.uniform(70, 100), 1)
        class_participation = round(random.uniform(65, 100), 1)
        test_scores = [round(random.uniform(60, 100), 1) for _ in range(3)]
        
        # Generate last updated timestamp
        last_updated = (datetime.now() - timedelta(days=random.randint(0, 7))).strftime("%Y-%m-%d %H:%M:%S")
        
        students.append({
            "id": i,
            "name": name,
            "grade": grade,
            "attendance": attendance,
            "subjects": student_subjects,
            "performance_metrics": {
                "homework_completion": homework_completion,
                "class_participation": class_participation,
                "test_scores": test_scores
            },
            "last_updated": last_updated
        })
    
    return students

# Generate sample data
students_data = generate_student_data(100)

@app.get("/")
async def root():
    return {"message": "Welcome to Student Analytics Dashboard API"}

@app.get("/students", response_model=List[Student])
async def get_students():
    return students_data

@app.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: int):
    student = next((s for s in students_data if s["id"] == student_id), None)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/analytics/summary")
async def get_analytics_summary():
    # Convert to DataFrame for analysis
    df = pd.DataFrame(students_data)
    
    # Calculate grade ranges
    grade_ranges = {
        "90-100": len(df[df["grade"] >= 90]),
        "80-89": len(df[(df["grade"] >= 80) & (df["grade"] < 90)]),
        "70-79": len(df[(df["grade"] >= 70) & (df["grade"] < 80)]),
        "60-69": len(df[(df["grade"] >= 60) & (df["grade"] < 70)]),
        "Below 60": len(df[df["grade"] < 60])
    }
    
    # Calculate subject-wise averages
    subject_stats = {}
    for subject in set([s for student in students_data for s in student["subjects"]]):
        subject_students = [s for s in students_data if subject in s["subjects"]]
        if subject_students:
            avg_grade = sum(s["grade"] for s in subject_students) / len(subject_students)
            subject_stats[subject] = round(avg_grade, 1)
    
    # Basic statistics
    stats = {
        "average_grade": df["grade"].mean(),
        "average_attendance": df["attendance"].mean(),
        "total_students": len(df),
        "grade_distribution": grade_ranges,
        "subject_stats": subject_stats,
        "top_performers": sorted(students_data, key=lambda x: x["grade"], reverse=True)[:5],
        "attendance_concerns": [s for s in students_data if s["attendance"] < 80]
    }
    
    # Generate detailed LLM insights
    insights_text = f"""
    Comprehensive Student Performance Analysis:
    
    Overall Statistics:
    - Average Grade: {stats['average_grade']:.2f}%
    - Average Attendance: {stats['average_attendance']:.2f}%
    - Total Students: {stats['total_students']}
    
    Grade Distribution:
    - Excellent (90-100): {grade_ranges['90-100']} students
    - Good (80-89): {grade_ranges['80-89']} students
    - Satisfactory (70-79): {grade_ranges['70-79']} students
    - Needs Improvement (60-69): {grade_ranges['60-69']} students
    - At Risk (Below 60): {grade_ranges['Below 60']} students
    
    Subject-wise Performance:
    {chr(10).join([f'- {subject}: {avg}%' for subject, avg in subject_stats.items()])}
    
    Top Performers:
    {chr(10).join([f'- {s["name"]}: {s["grade"]}%' for s in stats['top_performers']])}
    
    Attendance Concerns:
    {chr(10).join([f'- {s["name"]}: {s["attendance"]}%' for s in stats['attendance_concerns']])}
    
    Recommendations:
    1. Focus on students with attendance below 80%
    2. Provide additional support for students scoring below 60%
    3. Consider advanced programs for top performers
    4. Monitor subject-wise performance trends
    """
    
    # Use LLM to generate insights
    summary = summarizer(insights_text, max_length=250, min_length=100, do_sample=False)
    
    return {
        "statistics": stats,
        "llm_insights": summary[0]["summary_text"]
    }

@app.get("/analytics/performance/{student_id}")
async def get_student_performance(student_id: int):
    student = next((s for s in students_data if s["id"] == student_id), None)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate student's percentile
    all_grades = [s["grade"] for s in students_data]
    student_percentile = sum(1 for g in all_grades if g < student["grade"]) / len(all_grades) * 100
    
    # Generate detailed LLM insights for individual student
    performance_text = f"""
    Detailed Student Performance Analysis:
    
    Student Information:
    Name: {student['name']}
    Overall Grade: {student['grade']}%
    Attendance Rate: {student['attendance']}%
    Performance Percentile: {student_percentile:.1f}%
    
    Subject Performance:
    {chr(10).join([f'- {subject}' for subject in student['subjects']])}
    
    Detailed Metrics:
    - Homework Completion: {student['performance_metrics']['homework_completion']}%
    - Class Participation: {student['performance_metrics']['class_participation']}%
    - Test Scores: {', '.join([f'{score}%' for score in student['performance_metrics']['test_scores']])}
    
    Last Updated: {student['last_updated']}
    
    Recommendations:
    1. {'Maintain current performance level' if student['grade'] >= 90 else 'Focus on improving test scores' if any(score < 70 for score in student['performance_metrics']['test_scores']) else 'Work on class participation'}
    2. {'Excellent attendance' if student['attendance'] >= 95 else 'Consider improving attendance' if student['attendance'] < 85 else 'Good attendance, room for improvement'}
    3. {'Consider advanced placement' if student_percentile >= 90 else 'Focus on core subjects' if student_percentile < 50 else 'Continue current study plan'}
    """
    
    summary = summarizer(performance_text, max_length=200, min_length=100, do_sample=False)
    
    return {
        "student_data": student,
        "llm_insights": summary[0]["summary_text"],
        "percentile": student_percentile
    } 