## Nextjs

#### 1. create new nextjs app

```sh
npx create-next-app@latest cms --ts --tailwind --eslint
```

## Using shadcn

```sh
npx shadcn-ui@latest init
npx shadcn-ui@latest add alert avatar badge button card checkbox command dialog dropdown-menu form input label popover select separator table tabs

# workaround - issue from the new Nextjs upgrade
npm i lucide-react@0.263.1
```

## Add all dependencies

```sh
npm i -D prisma

npm i @clerk/nextjs @prisma/client @tanstack/react-table axios date-fns next-cloudinary next-themes react-hot-toast react-spinners zod zustand
```

## Directory structure

```sh
cms
├── app
│   ├── api
│   │   ├── [storeId]
│   │   │   ├── billboards
│   │   │   ├── categories
│   │   │   ├── checkout
│   │   │   ├── colors
│   │   │   ├── products
│   │   │   └── sizes
│   │   └── stores
│   │       └── [storeId]
│   ├── sign-in
│   ├── sign-up
│   ├── [storeId]
│   │   ├── billboards
│   │   ├── categories
│   │   ├── colors
│   │   ├── orders
│   │   ├── products
│   │   ├── settings
│   │   └── sizes
│   ├── `layout.tsx`
│   ├── `page.tsx`
│   └── `globals.css`
├── components
│   ├── modals
│   ├── navbar
│   ├── ui # shadcn-ui
│   └── ui-c # custom ui
├── hooks
├── lib
│   └── `utils.ts`
├── prisma
├── providers
├── public
├── `.env`
├── `middleware.ts`
├── `next.config.js`
├── `package.json`
├── `postcss.config.js`
├── `tailwind.config.ts`
└── `tsconfig.json`
```

## Clerk
#### 2. Create new project in [clerk.com](https://clerk.com/)
#### 3. Copy the API and secret key to .env

```sh
# .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```
#### 4. Mount <ClerkProvider> in `app/layout.tsx`

```tsx
// layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```
#### 5. create middleware `./middleware.ts`

```ts
// @/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/api/:path*"], // Public routes
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```
#### 6. sign-in page `/sign-in/[[...sign-in]]/page.tsx`

```tsx
// @/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn />;
}
```
#### 7. sign-up page `/sign-up/[[...sign-up]]/page.tsx`

```tsx
// @/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp />;
}
```
#### 8. update .env

```sh
# ...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Prisma
#### 1. Initialize prisma

```sh
npx prisma init
```
#### 2. create `@/lib/prismadb.ts`

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
```
#### 3. create new db in [planetscale](https://app.planetscale.com/) and store url .env

```sh
DATABASE_URL=...
```
#### 4. update `@/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url = env("DATABASE_URL")
  relationMode = "prisma"
}

model Store {
  id              String    @id @default(uuid())
  name            String
  userId          String
  billboards      Billboard[] @relation("StoreToBillboard")
  categories      Category[] @relation("StoreToCategory")
  products        Product[]  @relation("StoreToProduct")
  sizes           Size[]     @relation("StoreToSize")
  colors          Color[]     @relation("StoreToColor")
  orders          Order[]     @relation("StoreToOrder")
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model Billboard {
  id          String @id @default(uuid())
  storeId     String
  store       Store @relation("StoreToBillboard", fields: [storeId], references: [id])
  label       String
  imageUrl    String
  categories  Category[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([storeId])
}

model Category {
  id          String      @id @default(uuid())
  storeId     String      // Foreign Key to Store
  store       Store       @relation("StoreToCategory", fields: [storeId], references: [id])
  billboardId String      // Foreign Key to Billboard
  billboard   Billboard   @relation(fields: [billboardId], references: [id])
  name        String
  products    Product[]   @relation("CategoryToProduct")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([storeId])
  @@index([billboardId])
}

model Product {
  id          String    @id @default(uuid())
  storeId     String    // Foreign Key to Store
  store       Store     @relation("StoreToProduct", fields: [storeId], references: [id])
  categoryId  String    // Foreign Key to Category
  category    Category  @relation("CategoryToProduct", fields: [categoryId], references: [id])
  name        String
  price       Decimal
  isFeatured  Boolean   @default(false)
  isArchived  Boolean   @default(false)
  sizeId      String    // Foreign Key to Size
  size        Size      @relation(fields: [sizeId], references: [id])
  colorId     String    // Foreign Key to Color
  color       Color     @relation(fields: [colorId], references: [id])
  images      Image[]   // Relation to Image model
  orderItems  OrderItem[]   // Relation to Order model
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([storeId])
  @@index([categoryId])
  @@index([sizeId])
  @@index([colorId])
}

model Order {
  id        String    @id @default(uuid())
  storeId     String    // Foreign Key to Store
  store       Store     @relation("StoreToOrder", fields: [storeId], references: [id])
  orderItems OrderItem[] // Relation to OrderItem model
  isPaid     Boolean   @default(false)
  phone      String    @default("")
  address    String    @default("")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([storeId])
}

// Intermediary for a many-to-many relationship
model OrderItem {
  id        String  @id @default(uuid())
  orderId   String  // Foreign Key to Order
  order     Order   @relation(fields: [orderId], references: [id])
  productId String  // Foreign Key to Product
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
}

model Size {
  id          String    @id @default(uuid())
  storeId     String    // Foreign Key to Store
  store       Store     @relation("StoreToSize", fields: [storeId], references: [id])
  name        String
  value       String
  products    Product[] // Relation to Product model
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([storeId])
}

model Color {
  id          String   @id @default(uuid())
  storeId     String   // Foreign Key to Store
  store       Store    @relation("StoreToColor", fields: [storeId], references: [id])
  name        String
  value       String
  products    Product[] // Relation to Product model
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([storeId])
}

model Image {
  id          String   @id @default(uuid())
  productId   String   // Foreign Key to Product
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url         String   // URL of the image
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
}
```
#### 5. generate prisma client and push db

```sh
npx prisma generate
npx prisma db push
```

## Store Modal
#### 2. create _component_ `modal.tsx`

```tsx
//@/components/ui-c/modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal = ({
  title,
  description,
  preventClose,
  isOpen,
  onClose,
  children,
}: ModalProps) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent
        onInteractOutside={(event) => preventClose && event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
```
#### 3. create _hook_ `use-store-modal.tsx`

```tsx
//@/hooks/useStoreModal.tsx
import { create } from "zustand";

interface useStoreModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useStoreModal = create<useStoreModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
```
#### 4. create _api_ `/stores` POST

```ts
// @/app/api/stores/routes.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```
#### 5. create _provider_ `toast-provider.tsx`

```tsx
// @/app/providers/toast-provider.tsx
"use client";

import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return <Toaster />;
};
```

##### add <ToastProvider /> to `@/app/layout.tsx`

```tsx
// @/app/layout.tsx
// ...
<ClerkProvider>
  <html lang="en">
    <body className={inter.className}>
      <ToastProvider /> // add here
      {children}
    </body>
  </html>
</ClerkProvider>
// ...
```
#### 6. create _component_ `store-modal.tsx`

Using zod and react-hook-form.

[Zod](https://zod.dev/) is a TypeScript-first
schema declaration and validation library.

[react-hook-form](https://react-hook-form.com/ts)
is a performant, flexible and extensible
forms with easy-to-use validation.1

```tsx
// @/components/modals/store-modal.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Modal } from "@/components/ui-c/modal";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1),
});

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/stores", values);
      window.location.assign(`/${response.data.id}`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create store"
      description="Add a new store to manage products and categories."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
      preventClose={loading || pathname == "/"}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="E-Commerce"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={storeModal.onClose}
                  >
                    Cancel
                  </Button>
                  <Button disabled={loading} type="submit">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  );
};
```
#### 7. create _provider_ `modal-provider.tsx`

```tsx
// @/providers/modal-provider.tsx
"use client";

import { useEffect, useState } from "react";

import { StoreModal } from "@/components/modals/store-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR render + mount on client side.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <StoreModal />
    </>
  );
};
```

##### add <ModalProvider /> to `@/app/layout.tsx`

```tsx
// @/app/layout.tsx
// ...
<ClerkProvider>
  <html lang="en">
    <body className={inter.className}>
      <ModalProvider /> // add here
      {children}
    </body>
  </html>
</ClerkProvider>
// ...
```
#### 9. update _page_ `app/page.tsx`

```tsx
// @/app/(root)/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useStoreModal } from "@/hooks/use-store-modal";

const SetupPage = () => {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null;
};

export default SetupPage;
```

## Store Dashboard `@/app/[storeid]/`

### Navbar
#### create _layout_ `/[storeid]/layout.tsx`

```tsx
// @/[storeid]/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <>
      Navbar {/*TODO*/}
      {children}
    </>
  );
}
```
#### create _page_ `/[storeid]/page.tsx`

```tsx
// @/[storeid]/page.tsx
const Page = () => {
  return <div>Page</div>;
};
export default Page;
```
#### create _component_ `navbar.tsx`

```tsx
// @/components/navbar.tsx
import { UserButton, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

const Navbar = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  });

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* TODO <StoreSwitcher /> */}
        {/* TODO <MainNav /> */}
        <div className="ml-auto flex items-center space-x-4">
          {/* TODO <ThemeToggle /> */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
```
#### create _component_ `store-switcher.tsx`

```tsx
// @/components/store-switcher.tsx
"use client";

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Store as StoreIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStoreModal } from "@/hooks/use-store-modal";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Record<string, any>[];
}

export default function StoreSwitcher({
  className,
  items = [],
}: StoreSwitcherProps) {
  const storeModal = useStoreModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const currentStore = formattedItems.find(
    (item) => item.value === params.storeId
  );

  const [open, setOpen] = useState(false);

  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false);
    router.push(`/${store.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}
        >
          <StoreIcon className="mr-2 h-4 w-4" />
          {currentStore?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search store..." />
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandGroup heading="Stores">
              {formattedItems.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onStoreSelect(store)}
                  className="text-sm"
                >
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentStore?.value === store.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  storeModal.onOpen();
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```
#### create _component_ `main-nav.tsx`

```tsx
// @/components/main-nav.tsx
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Overview",
      active: pathname === `/${params.storeId}`,
    },
    // {
    //   href: `/${params.storeId}/billboards`,
    //   label: 'Billboards',
    //   active: pathname === `/${params.storeId}/billboards`,
    // },
    // {
    //   href: `/${params.storeId}/categories`,
    //   label: 'Categories',
    //   active: pathname === `/${params.storeId}/categories`,
    // },
    // {
    //   href: `/${params.storeId}/sizes`,
    //   label: 'Sizes',
    //   active: pathname === `/${params.storeId}/sizes`,
    // },
    // {
    //   href: `/${params.storeId}/colors`,
    //   label: 'Colors',
    //   active: pathname === `/${params.storeId}/colors`,
    // },
    // {
    //   href: `/${params.storeId}/products`,
    //   label: 'Products',
    //   active: pathname === `/${params.storeId}/products`,
    // },
    // {
    //   href: `/${params.storeId}/orders`,
    //   label: 'Orders',
    //   active: pathname === `/${params.storeId}/orders`,
    // },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathname === `/${params.storeId}/settings`,
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
```

### Settings Tab
#### create _page_ `/[storeId]/settings/page.tsx`

```tsx
// @/app/[storeId]/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

const SettingsPage = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* TODO <SettingsForm initialData={store} /> */}
      </div>
    </div>
  );
};

export default SettingsPage;
```
#### create _component_ `settings-form.tsx`

```tsx
// @/app/[storeId]/settings/components/settings-form.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Store } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { Heading } from "@/components/ui-c/heading";
import { AlertModal } from "@/components/modal/AlertModal";
import { ApiAlert } from "@/components/ui-c/api-alert";
import { useOrigin } from "@/hooks/use-origin";

const formSchema = z.object({
  name: z.string().min(2),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("Store updated.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted.");
    } catch (error: any) {
      toast.error("Make sure you removed all products and categories first.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Store settings"
          description="Manage store preferences"
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};
```
#### create _component_ `heading.tsx`

```tsx
// @/app/[storeId]/settings/components/heading
interface Props {
  title: string;
  description: string;
}

export const Heading = ({ title, description }: Props) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
```
#### create _api_ `/api/stores/[storeId]` PATCH DELETE

PATCH -> update store
DELETE -> delete store

```ts
// @/app/api/stores/[storeId]/routes.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```
#### create _component_ `AlertModal.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui-c/modal";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
      preventClose={loading}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
```
#### create _component_ `api-alert.tsx`

```tsx
// @/app/components/ui-c/api-alert.tsx
"use-client";

import { Copy as CopyIcon, Server as ServerIcon } from "lucide-react";
import { toast } from "react-hot-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApiAlertProps {
  title: string;
  description: string;
  variant: "public" | "admin";
}

const textMap: Record<ApiAlertProps["variant"], string> = {
  public: "Public",
  admin: "Admin",
};

const variantMap: Record<ApiAlertProps["variant"], BadgeProps["variant"]> = {
  public: "secondary",
  admin: "destructive",
};

export const ApiAlert: React.FC<ApiAlertProps> = ({
  title,
  description,
  variant = "public",
}) => {
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("API Route copied to clipboard.");
  };

  return (
    <Alert>
      <AlertTitle className="flex items-center gap-x-2">
        <ServerIcon className="h-4 w-4" />
        {title}
        <Badge className="bg-zinc-200" variant={variantMap[variant]}>
          {textMap[variant]}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-zinc-300/50 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
```
#### create _hook_ `use-origin.tsx`

```tsx
// @/app/hooks/use-origin.tsx
import { useEffect, useState } from "react";

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return "";
  }

  return origin;
};
```

### Billboard Tab
#### create _page_ `/[storeId]/billboard/page.tsx`

```tsx
// @/app/[storeId]/billboard/page.tsx
```
#### create _component_ `billboard-client.tsx`

```tsx
// @/app/[storeId]/billboard/components/billboard-client.tsx
```
#### create _page_ `/[storeId]/billboard/[billboard_id]/page.tsx`

```tsx
// @/app/[storeId]/billboard/[billboard_id]/page.tsx
```
#### create _component_ `[billboard_id]/components/billboard-form.tsx`

```tsx
// @/app/[storeId]/billboard/[billboard_id]/components/billboard-form.tsx
```
#### update `.env` with cloudinary keys
#### update `next.config.js`

```js
```
#### _api_ `/api/[storeId]/billboard` POST GET

POST -> create billboard
GET -> get billboards

```ts
// @/api/[storeId]/billboard/routes.ts
```
#### _api_ `/api/[storeId]/billboard/[billboard_id]` GET DELETE PATCH

GET -> get billboard by id
DELETE -> delete billboard by id
PATCH -> update billboard by id

```ts
// @/api/[storeId]/billboard/[billboard_id]/routes.ts
```
#### _component_ `data-table.tsx`

```tsx
// @/app/components/ui-c/data-table.tsx
```
#### _component_ `billboard/components/column.tsx`

created by referencing shadcn site

```tsx
// @/app/[storeId]/billboard/components/column.tsx
```
#### _component_ `billboard/components/cell-action.tsx`

```tsx
// @/app/[storeId]/billboard/components/cell-action.tsx
```
#### _component_ `api-list.tsx`

```tsx
// @/app/components/ui-c/api-list.tsx
```

### Categories Tab
#### update `prisma.schema` with category model

```prisma

```

### Sizes
### Colors
### Products
### Orders
