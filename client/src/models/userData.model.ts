export interface userDataAcccessModel {
  name: string;
  phone: string;
  email: string;
  role: string;
  code: string;
}

export type userDataModel = Omit<userDataAcccessModel, "code">;

export interface userDatalogin {
  name: string;
  phone: string;
  email: string;
  //role: string;;
}

export interface userDataRegister {
  userName: string;
  password: string;
}
