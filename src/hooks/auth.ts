"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import {
  forgotPassword,
  resendTFAOtp,
  signin,
  signUp,
  verifyOtp,
  verifyTfaOtp,
} from "@/services/auth";
import type { IAPIError, IAPIResponse } from "@/types/api";
import type {
  ISigninResponse,
  ISignupResponse,
  IVerifyOtpResponse,
  IVerifyTfaOtpResponse,
} from "@/types/auth";
import { openToast } from "@/utils/toaster";
import { setToken } from "@/utils/token";

import { useRequestEmailVerification } from "./me";

export const useSignin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  // const { requestEmailVerification } = useRequestEmailVerification();

  const onSuccess = (data: ISigninResponse) => {
    // if (!data?.TFAEnabled) {
      if (data?.token) {
        setToken(data.token);
  //       if (data.emailVerified) {
          queryClient.invalidateQueries({ queryKey: ["me"] });
          Cookies.set("emailVerified", "true");
          openToast("success", data.message || "Logged in successfully");
          router.push("/dashboard");
  //       } else {
  //         // Cookies.set("emailVerified", "false");
  //         // Cookies.set("VFEmail", data.email);
  //         // requestEmailVerification();
  //         // router.push("/verify-email");
  //       }
  //     } else {
  //       openToast("error", data.message || "Something went wrong");
  //     }
    }
      // else {
  //     // Cookies.set("TFAEmail", data.email);
  //     openToast("success", data.message);
  //     // router.push("/verify-tfa");
  //   }
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["signin"],
    mutationFn: signin,
    onSuccess,
    onError,
  });

  return {
    signin: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { requestEmailVerification } = useRequestEmailVerification();

  const onSuccess = (data: ISignupResponse) => {
    if (data?.token) {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      Cookies.set("emailVerified", "false");
      Cookies.set("VFEmail", data.email);
      requestEmailVerification();
      router.push("/verify-email");
    }
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["signup"],
    mutationFn: signUp,
    onSuccess,
    onError,
  });

  return {
    signup: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useForgotPassword = () => {
  const router = useRouter();

  const onSuccess = () => {
    openToast("success", "OTP sent successfully");
    router.push("/otp-verification");
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["forgotPassword"],
    mutationFn: forgotPassword,
    onSuccess,
    onError,
  });

  return {
    forgotPassword: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useVerifyOtp = () => {
  const router = useRouter();

  const onSuccess = (data: IVerifyOtpResponse) => {
    const { token } = data;
    Cookies.set("token", token as string);
    Cookies.set("emailVerified", "true");

    openToast("success", "OTP verified successfully");

    Cookies.set("allowChangePassword", "true");
    router.push("/change-password");
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: verifyOtp,
    onSuccess,
    onError,
  });

  return {
    verifyOtp: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("emailVerified");
    queryClient.invalidateQueries({ queryKey: ["getMe"] });
    localStorage.clear();
    openToast("success", "Logged out successfully");
    router.push("/sign-in");
  };

  return { logout };
};

export const useResendTfaOtp = () => {
  const onSuccess = (data: IAPIResponse) => {
    openToast("success", data.message);
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["resendTfaOtp"],
    mutationFn: resendTFAOtp,
    onSuccess,
    onError,
  });

  return {
    resendTfaOtp: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useVerifyTfaOtp = () => {
  const router = useRouter();

  const onSuccess = (data: IVerifyTfaOtpResponse) => {
    openToast("success", data.message);
    setToken(data.token as string);
    Cookies.set("emailVerified", "true");
    Cookies.remove("TFAEmail");
    router.push("/dashboard");
  };

  const onError = (error: IAPIError) => {
    openToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ["verifyTfaOtp"],
    mutationFn: verifyTfaOtp,
    onSuccess,
    onError,
  });

  return {
    verifyTfaOtp: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
