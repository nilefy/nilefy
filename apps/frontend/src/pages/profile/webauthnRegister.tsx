import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { startRegistration } from '@simplewebauthn/browser';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';

export function SetupBiometricSection() {
  const { toast } = useToast();
  const form = useForm<never>({});

  async function onSubmit() {
    console.log('start the setup');

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
    const options = await api.auth.getWebauthnOptions();
    console.log(
      '🪵 [webauthnRegister.tsx:13] ~ token ~ \x1b[0;32moptions\x1b[0m = ',
      options,
    );

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(options);
    } catch (error) {
      console.error(
        '🪵 [webauthnRegister.tsx:28] ~ token ~ \x1b[0;32merror\x1b[0m = ',
        error,
      );
      // Some basic error handling
      if (error.name === 'InvalidStateError') {
        console.error(
          'Error: Authenticator was probably already registered by user',
        );
      } else {
        console.error(error);
      }

      throw error;
    }

    console.log(
      '🪵 [webauthnRegister.tsx:48] ~ token ~ \x1b[0;32mattResp\x1b[0m = ',
      attResp,
    );
    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    const verificationJSON =
      await api.auth.verifyWebauthnRegisterationResponse(attResp);

    if (verificationJSON && verificationJSON.verified) {
      toast({
        variant: 'default',
        title: 'Success!',
      });
    } else {
      toast({
        variant: 'destructive',
        title: `Oh no, something went wrong! Response: ${JSON.stringify(
          verificationJSON,
        )}`,
      });
    }
  }

  return (
    <Card className="w-4/6">
      <CardHeader>
        <CardTitle>Passcodes 2FA</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Button type="submit">Setup passcode</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
