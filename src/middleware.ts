export { default } from "next-auth/middleware";

// sin un matcher por defecto el middleware se aplica a todo el proyecto
export const config = { matcher: ["/middleware"] };
