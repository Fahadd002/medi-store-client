"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/blog.type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, MessageCircle } from "lucide-react";

const BlogCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="overflow-hidden">
      {post.thumbnail && (
        <div className="relative h-48 w-full">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <CardHeader>
        <CardTitle className="line-clamp-2">
          {post.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {post.views}
          </span>

          {/* Comment count */}
          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {post._count?.comments ?? 0}
          </span>
        </div>

        <Link
          href={`/blogs/${post.id}`}
          className="font-medium text-primary hover:underline"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
