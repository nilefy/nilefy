import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      id="error-page"
      className="flex h-screen w-screen  flex-col items-center justify-center gap-5"
    >
      <h1 className="text-5xl">Oops!</h1>
      <p className="">Sorry, an unexpected error has occurred.</p>
      <p className="text-gray-400">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
