const BASE_URL = "http://localhost:5000";

export const registerStudent = async (studentData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.text();
};

export const getStudents = async () => {
  const response = await fetch(`${BASE_URL}/students`);
  if (!response.ok) throw new Error("Failed to fetch students");
  return response.json();
};

export const loginStudent = async (credentials) => {
  const response = await fetch(`${BASE_URL}/login/student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
};

export const loginMentor = async (credentials) => {
  const response = await fetch(`${BASE_URL}/login/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
};
