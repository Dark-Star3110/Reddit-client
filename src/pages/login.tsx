import React from "react";
import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useRouter } from "next/router";
import { useCheckAuth } from "../utils/useCheckAuth";
import { useToast } from "@chakra-ui/react";
import NextLink from "next/link";
import { initializeApollo } from "../lib/apolloClient";

const Login = () => {
  const router = useRouter();
  const { data: dataAuth, loading: loadingAuth } = useCheckAuth();
  const initialValues: LoginInput = {
    usernameOrEmail: "",
    password: "",
  };
  const toast = useToast();

  const [loginUser, { loading: _loginUserLoading, error }] = useLoginMutation();

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        // console.log('data',data);
        // const meData = cache.readQuery({query:MeDocument})
        // console.log('cache',meData);
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.login.user },
          });
        }
      },
    });
    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login.user) {
      // register success
      router.push("/");
      const apolloClient = initializeApollo();
      apolloClient.resetStore();

      toast({
        title: "Login successfully",
        description: `Welcom ${response.data.login.user.username}`,
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
        <Wrapper size="small">
          {error && <p>Fail to login</p>}
          <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  placeholder="Username Or Email"
                  label="Username Or Email"
                  type="text"
                />
                <Box mt={4}>
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                </Box>

                <Flex mt={5}>
                  <NextLink href="/forgot-password">
                    <Link ml="auto">Forgot Password</Link>
                  </NextLink>
                </Flex>

                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Login;
