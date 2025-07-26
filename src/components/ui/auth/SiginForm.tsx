"use client";

import { Formik } from "formik";
import React from "react";
import { toFormikValidationSchema } from "zod-formik-adapter";

import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Typography from "@/components/Typography";
import { colors } from "@/constants/ui";
import { useSignin } from "@/hooks/auth";
import type { ISigninPayload } from "@/types/auth";
import { LoginUserValidationSchema } from "@/validations/auth";

const SiginForm = () => {
  const { signin, isLoading } = useSignin();

  const initialValues = {
    phone: "",
    password: "",
  };

  const handleSubmit = (values: ISigninPayload) => {
    signin(values);
  };

  return (
    <div className="flex flex-col gap-3 ">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={toFormikValidationSchema(LoginUserValidationSchema)}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form className="flex flex-col gap-3 " onSubmit={handleSubmit}>
            <Input
              type="text"
              label="Phone"
              name="phone"
              placeholder="Your phone number"
              onChange={handleChange}
              value={values.phone}
              onBlur={handleBlur}
              error={!!touched.phone && !!errors.phone}
              helperText={errors.phone}
            />
            <Input
              type="password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={values.password}
              onBlur={handleBlur}
              error={!!touched.password && !!errors.password}
              helperText={errors.password}
            />
            <div className="flex flex-col items-start gap-2 justify-between">
              <div className="flex gap-1">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember">
                  <Typography
                    type="body"
                    size="regular"
                    className="cursor-pointer"
                    color={colors.light}
                  >
                    Remember me
                  </Typography>
                </label>
              </div>
              {/*<Typography*/}
              {/*  underline={false}*/}
              {/*  className="!font-normal"*/}
              {/*  type="link"*/}
              {/*  href="/forgot-password"*/}
              {/*>*/}
              {/*  Forgot password?*/}
              {/*</Typography>*/}
            </div>
            <Button type="submit" loading={isLoading} className="mt-2" w_full>
              Login In
            </Button>
          </form>
        )}
      </Formik>

      {/*<ORText />*/}
      {/*<GoogleButton onClick={() => {}} />*/}
      {/*<div className="mt-3 flex items-center justify-center">*/}
      {/*  <Typography*/}
      {/*    type="body"*/}
      {/*    color={colors.subtle}*/}
      {/*    size="sm"*/}
      {/*    style={{ margin: 0 }}*/}
      {/*  >*/}
      {/*    Don't have an account?{" "}*/}
      {/*    <Typography type="link" href="/sign-up">*/}
      {/*      Sign Up*/}
      {/*    </Typography>*/}
      {/*  </Typography>*/}
      {/*</div>*/}
    </div>
  );
};

export default SiginForm;
