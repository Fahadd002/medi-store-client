import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { blogService } from "@/services/blog.service";

const BlogPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { data } = await blogService.getBlogById(id);

  if (!data) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Blog not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card>
        <CardHeader className="space-y-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {data.title.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium">{data.authorId}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-3xl leading-tight">
            {data.title}
          </CardTitle>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Meta */}
          <div className="text-sm text-muted-foreground flex gap-4">
            <span>{data.views} views</span>
            <span>{data._count.comments} comments</span>
            <span>{data.status}</span>
          </div>
        </CardHeader>

        <Separator />

        {/* Content */}
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
          {data.content}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
