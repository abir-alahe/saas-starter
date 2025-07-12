import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function testimonialCard({
  name,
  profile,
  description,
  time,
  date,
  postImage,
  link,
  like,
}: {
  name: string;
  profile: string;
  description: string;
  time: string;
  date: string;
  postImage: string;
  link: string;
  like: number;
}) {
  return (
    <div className="p-4 rounded-lg bg-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          href={link}
          target="_blank"
          className="inline-flex items-center gap-2"
        >
          <figure className="">
            <Image
              className="aspect-square rounded-full size-[44px] overflow-hidden "
              src={profile}
              alt={name}
              width={100}
              height={100}
            />
          </figure>
          <div className="flex flex-col gap-1">
            <h3 className="text-base/4 font-semibold hover:underline">
              {name}{" "}
            </h3>
            <p className="text-sm/4 text-muted-foreground">{`@${name}`}</p>
          </div>
        </Link>
        <Link href={link} target="_blank">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <g>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
          </svg>
        </Link>
      </div>
      <div className="text-base font-medium">
        <div>{description}</div>
      </div>
      <Link href={link} target="_blank">
        <Image
          className="aspect-[16/9] rounded-lg w-full"
          src={postImage}
          alt={name}
          width={1000}
          height={1000}
        />
      </Link>
      <Link
        href={link}
        target="_blank"
        className="flex items-center justify-start"
      >
        <p className="text-sm/4 text-muted-foreground mr-1">{time}</p>
        <span className="text-muted-foreground">•</span>
        <p className="text-sm/4 text-muted-foreground ml-1">{date}</p>
      </Link>

      <div className="flex items-center justify-start gap-4">
        {/* icon Love */}
        <Link
          href={link}
          target="_blank"
          className="flex items-center gap-1 group"
        >
          <div className="text-sm/4 text-muted-foreground size-[30px] flex items-center justify-center rounded-full group-hover:bg-[#ffc8ea]">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <g>
                <path
                  className="fill-[#F91880]"
                  d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                ></path>
              </g>
            </svg>
          </div>
          <p className="text-sm group-hover:text-[#F91880] font-bold group-hover:underline">
            {like}
          </p>
        </Link>

        {/* icon Reply */}
        <Link
          href={link}
          target="_blank"
          className="group flex items-center gap-1"
        >
          <div className="text-muted-foreground size-[30px] flex items-center justify-center rounded-full group-hover:bg-[#bae0fd] hover:text-white transition-all duration-100 ">
            <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
              <g>
                <path
                  className="fill-[#1D9BF0]"
                  d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"
                ></path>
              </g>
            </svg>
          </div>
          <p className="text-sm group-hover:text-[#0372c6] font-bold group-hover:underline">
            Reply
          </p>
        </Link>

        {/* icon Copy */}
        <Link
          href={link}
          target="_blank"
          className="group flex items-center gap-1"
        >
          <div className="text-muted-foreground size-[30px] flex items-center justify-center rounded-full group-hover:bg-[#cdfee5] hover:text-white transition-all duration-100">
            <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
              <g className="fill-gray-500 group-hover:fill-[#00BA7C] transition-all duration-100">
                <path
                  className=""
                  d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"
                ></path>
              </g>
            </svg>
          </div>
          <p className="text-sm group-hover:text-[#00ba7c] font-bold group-hover:underline">
            Copy Link
          </p>
        </Link>
      </div>
    </div>
  );
}
