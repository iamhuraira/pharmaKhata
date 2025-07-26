export type IAPIResponse = {
  message: string;
  success: boolean;
};

export type IPaginationPayload = {
  page?: number;
  limit?: number;
};

export type IAPIError = {
  name: string;
  message: string;
  stack?: string;

  response:
    | any
    | {
        data: {
          message: string;
          success: boolean;
          error: null | any;
        };
      };
};

export type IAPISuccess = {
  name: string;
  message: string;
  stack?: string;
  response:
    | any
    | {
        data: {
          message: string;
          success: boolean;
        };
      };
};
