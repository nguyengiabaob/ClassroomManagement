import { AxiosClient } from "../../shared/axios.client";

export interface userInforamation {
  phone: string;
  email: string;
  fullName: string;
  id: string;
}

export interface studentData {
  phone: string;
  email: string;
  fullName: string;
}

export const addNewStudents = async (data: userInforamation) =>
  await AxiosClient.post<userInforamation>("/api/student/addStudent", {
    data: data,
  });

export const getStudents = async () =>
  await AxiosClient.get<userInforamation[]>("/api/student/getStudents");

export const updateStudents = async (data: userInforamation) =>
  await AxiosClient.put<userInforamation>("/api/student/updateStudent", {
    data: data,
    id: data.id,
  });
