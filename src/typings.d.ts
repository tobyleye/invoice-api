type User = {
  id: string;
  email: string;
  name: string;
};

declare namespace Express {
  export interface Request {
    user?: User;
  }
}
