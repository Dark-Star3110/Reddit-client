import { Box, Button, Flex, Spinner, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";
import NextLink from "next/link";

const ForgotPassword = () => {
  const { data: dataAuth, loading: loadingAuth } = useCheckAuth();
  const initialValues = { email: "" };
  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();
  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: { forgotPasswordInput: values },
    });
  };

  if (loadingAuth || (!loadingAuth && dataAuth?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="100vh">
        <Spinner />
      </Flex>
    );
  } else {
  }
  return (
    <Wrapper size="small">
      <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
        {({ isSubmitting }) =>
          !loading && data ? (
            <Box>Please check Inbox</Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="text"
              />
              <Flex mt={5}>
                <NextLink href="/login">
                  <Link ml="auto">Back to login</Link>
                </NextLink>
              </Flex>
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Send Reset Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
