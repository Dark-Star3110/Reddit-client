import React from "react";
import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useRouter } from "next/router";
import { useCheckAuth } from "../utils/useCheckAuth";
import { useToast } from "@chakra-ui/react";

const Register = () => {
  const router = useRouter();
  const { data: dataAuth, loading: loadingAuth } = useCheckAuth();
  const initialValues: RegisterInput = {
    username: "",
    password: "",
    email: "",
  };
  const toast = useToast();

  const [registerUser, { loading: _registerUserLoading, error }] =
    useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.register.user },
          });
        }
      },
    });
    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.user) {
      // register success
      router.push("/");
      toast({
        title: "Register successfully",
        description: `Welcom ${response.data.register.user.username}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    console.log("Response", response);
  };
  return (
    <>
      {loadingAuth || (!loadingAuth && dataAuth?.me) ? (
        <Flex justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Wrapper>
          {error && <p>Fail to register</p>}
          <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="username"
                  placeholder="Username"
                  label="Username"
                  type="text"
                />
                <Box mt={4}>
                  <InputField
                    name="email"
                    placeholder="Email"
                    label="Email"
                    type="text"
                  />
                </Box>
                <Box mt={4}>
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                </Box>

                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Register;
