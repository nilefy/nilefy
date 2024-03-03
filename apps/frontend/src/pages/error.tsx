import { buttonVariants } from '@/components/ui/button';
import { FetchXError } from '@/utils/fetch';
import { Link, useRouteError } from 'react-router-dom';

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
        <i>
          {error instanceof Error || error instanceof FetchXError
            ? error.message
            : 'unknown error'}
        </i>
      </p>
      <Link
        to={'/'}
        reloadDocument={true}
        className={buttonVariants({ variant: 'default' })}
      >
        Return To Home
      </Link>
    </div>
  );
}
