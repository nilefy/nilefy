# Use-case: Hiring Metrics dashboard
In This example, I'll walk you through the steps to create a hiring metrics dashboard example using Nilefy. 

[![Follow Through Video](https://img.youtube.com/vi/jBjrtYf3Fdg/0.jpg)](https://youtu.be/jBjrtYf3Fdg)


Before we start, what we are about to build is basically a tool to empower your HR teams, hiring managers, and senior leaders with an advanced hiring metrics dashboard that offers real-time insights into the recruitment process. Featuring a user-friendly interface to evaluate key metrics and automated tools for candidate communication, this dashboard streamlines your hiring workflow and accelerates the time-to-hire, making your recruitment efforts more efficient and effective.

### Let's start by building the database we're going to use
For this example I'm going to use postgres db and do the following: 
Step 1: Create the Database Schema
1. Create Tables: You'll need tables for applicants, applications, and possibly other related tables.
2. Define Columns: you'll need columns for name, email, phone number, years of experience, role applied for, location, resume link, status, etc.

### Here is a basic SQL schema that you can use:

``` sql
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    years_of_experience INT,
    role_applied_for VARCHAR(255),
    location VARCHAR(255),
    resume_link VARCHAR(255),
    status VARCHAR(50)
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    applicant_id INT REFERENCES applicants(id),
    job_role VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```