export interface IUser {
	_id: string;
	username: string;
	password: string;
	role: string;
	resetPassword: boolean;
	accountLocked: boolean;
	failedLoginAttempts: number;
	lastFailedLoginDate: Date | null;
	createdAt: Date;
}

export interface IUserService {
	register(user: IUser): Promise<IUser>;
	userProfile(id: string): Promise<IUser>;
	/*   displayAllEmployees(page: number, pageSize: number): Promise<{
    employeeMembers: IUser[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;
  removeMember(id: string): Promise<IUser>;
  editMemberRole(id: string, memberRole: string): Promise<IUser>;
  updatePassword(userId: string, userPassword: string): Promise<IUser>;
  userValidationContainer(body: IUser, keys: (keyof IUser)[]): Promise<null>; */
}
