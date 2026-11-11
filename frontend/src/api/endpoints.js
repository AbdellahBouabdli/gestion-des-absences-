import api from './client';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const teacherApi = {
  dashboard: () => api.get('/teacher/dashboard').then((r) => r.data),
  groups: () => api.get('/teacher/groups').then((r) => r.data),
  students: (params = {}) => api.get('/teacher/students', { params }).then((r) => r.data),
  schedule: (params = {}) => api.get('/teacher/schedule', { params }).then((r) => r.data),
  absences: (params = {}) => api.get('/teacher/absences', { params }).then((r) => r.data),
  createAbsence: (payload) => api.post('/teacher/absences', payload).then((r) => r.data),
  updateAbsence: (id, payload) => api.put(`/teacher/absences/${id}`, payload).then((r) => r.data),
  justifyAbsence: (id) => api.post(`/teacher/absences/${id}/justify`).then((r) => r.data),
  deleteAbsence: (id) => api.delete(`/teacher/absences/${id}`).then((r) => r.data),
  justifications: (status) =>
    api.get('/teacher/justifications', { params: status ? { status } : {} }).then((r) => r.data),
  reviewJustification: (id, payload) =>
    api.patch(`/teacher/justifications/${id}`, payload).then((r) => r.data),
};

export const studentApi = {
  dashboard: () => api.get('/student/dashboard').then((r) => r.data),
  schedule: (params = {}) => api.get('/student/schedule', { params }).then((r) => r.data),
  absences: () => api.get('/student/absences').then((r) => r.data),
  absence: (id) => api.get(`/student/absences/${id}`).then((r) => r.data),
  justifications: () => api.get('/student/justifications').then((r) => r.data),
  submitJustification: (absenceId, formData) =>
    api.post(`/student/absences/${absenceId}/justification`, formData).then((r) => r.data),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  students: (params = {}) => api.get('/admin/students', { params }).then((r) => r.data),
  student: (id) => api.get(`/admin/students/${id}`).then((r) => r.data),
  createStudent: (payload) => api.post('/admin/students', payload).then((r) => r.data),
  updateStudent: (id, payload) => api.put(`/admin/students/${id}`, payload).then((r) => r.data),
  teachers: () => api.get('/admin/teachers').then((r) => r.data),
  createTeacher: (payload) => api.post('/admin/teachers', payload).then((r) => r.data),
  updateTeacher: (id, payload) => api.put(`/admin/teachers/${id}`, payload).then((r) => r.data),
  groups: () => api.get('/admin/groups').then((r) => r.data),
  createGroup: (payload) => api.post('/admin/groups', payload).then((r) => r.data),
  updateGroup: (id, payload) => api.put(`/admin/groups/${id}`, payload).then((r) => r.data),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`).then((r) => r.data),
};

export async function downloadJustification(id, fileName = 'justificatif') {
  const response = await api.get(`/files/justifications/${id}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
