import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type User =
  | {
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    }
  | undefined;

type Props = {
  user: User;
  pagetype: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
}

export default function UserInfo({ user, pagetype }: Props) {
  const userImage = user?.image ? (
    <Avatar>
      <AvatarImage src={user.image} />
      <AvatarFallback>
        {getInitials(user?.name ?? "Profile Pic")}
      </AvatarFallback>
    </Avatar>
  ) : null;

  const userMain = user?.name ? (
    <div className="flex gap-4 justify-center items-center p-4 font-bold text-lg text-secondary-foreground">
      {userImage}
      {user?.name}
    </div>
  ) : null;

  const emailDisplay = user?.email ? (
    <div>{`e-mail: ${user?.email}`}</div>
  ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`Bienvenido a ${pagetype}`}</CardTitle>
      </CardHeader>
      <CardContent>{userMain}</CardContent>
      <CardFooter>{emailDisplay}</CardFooter>
    </Card>
  );
}
