import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import NextLink from "next/link";
import { useCheckAuth } from "../utils/useCheckAuth";

const ChangePassword = () => {
  const { data: dataAuth, loading: loadingAuth } = useCheckAuth();
  const router = useRouter();
  const initialValues = { newPassword: "" };
  const [tokenError, setTokenError] = useState("");

  const [changePassword, { loading }] = useChangePasswordMutation();
  const onChangePasswordSubmit = async (
    value: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (router.query.userId && router.query.token) {
      const res = await changePassword({
        variables: {
          userId: router.query.userId as string,
          token: router.query.token as string,
          changePasswordInput: value,
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data.changePassword.user },
            });
          }
        },
      });
      if (res.data?.changePassword.errors) {
        const fieldError = mapFieldErrors(res.data.changePassword.errors);
        if ("token" in fieldError) {
          setTokenError(fieldError.token);
        }
        setErrors(fieldError);
      } else if (res.data?.changePassword.user) {
        router.push("/");
      }
    }
  };

  if (loadingAuth || (!loadingAuth && dataAuth?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="100vh">
        <Spinner />
      </Flex>
    );
  } else if (!router.query.token || !router.query.userId) {
    return (
      <Wrapper size="small">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid userName and token</AlertTitle>
        </Alert>
        <Flex mt={5}>
          <NextLink href="/login">
            <Link ml="auto">Back to login</Link>
          </NextLink>
        </Flex>
      </Wrapper>
    );
  }
  return (
    <Wrapper size="small">
      <Formik initialValues={initialValues} onSubmit={onChangePasswordSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />

            {tokenError && (
              <Flex>
                <Box color="red" mr={2}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>go back to forgot password</Link>
                </NextLink>
              </Flex>
            )}
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Send Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
