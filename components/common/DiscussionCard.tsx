"use client";

import React, { useCallback, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	EditIcon,
	FlagIcon,
	MessageSquareIcon,
	StarIcon,
	ThumbsUpIcon,
	TrashIcon,
} from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "../ui/card";
import ProfileCard from "./ProfileCard";
import { DotsHorizontalIcon, Share1Icon } from "@radix-ui/react-icons";
import Comments from "../comments/Comments";
import { cn } from "@/lib/utils";
import { Discussion } from "@/types/schema";
import moment from "moment";
import "moment/locale/ko";
import MDEditor from "@uiw/react-md-editor";
import { useSession } from "next-auth/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DiscussionForm, {
	discussionFormSchema,
} from "../discussions/DiscussionForm";
import {
	useDeleteDiscussion,
	usePatchDiscussion,
} from "@/lib/queries/discussions";
import * as z from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useRouter } from "next/navigation";

interface DiscussionCardProps {
	discussion: Discussion;
	onLike: (id: number) => void;
}

function DiscussionCard({ discussion, onLike }: DiscussionCardProps) {
	const [openComments, setOpenComments] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const { data: session } = useSession();
	const patchDiscussion = usePatchDiscussion();
	const deleteDiscussion = useDeleteDiscussion();

	const isAuthor = discussion.User.id === session?.id;
	const liked = discussion.Likes?.some((like) => like.User.id === session?.id);
	const router = useRouter();

	const handleUpdate = useCallback(
		(values: z.infer<typeof discussionFormSchema>) => {
			patchDiscussion.mutate(
				{
					...values,
					id: discussion.id,
				},
				{
					onSuccess: (res) => {
						setIsEdit(false);
					},
				}
			);
		},
		[patchDiscussion]
	);

	const handleDelete = useCallback(() => {
		deleteDiscussion.mutate(
			{ id: discussion.id },
			{
				onSuccess: () => {
					if (!discussion.parent_id) router.replace("/questions");
				},
			}
		);
	}, [deleteDiscussion]);

	return (
		<Card>
			{!isEdit ? (
				<>
					<CardHeader className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<CardTitle>{discussion.title}</CardTitle>
							<AlertDialog>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="ghost">
											<DotsHorizontalIcon />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{isAuthor && (
											<>
												<DropdownMenuItem
													className="cursor-pointer"
													onClick={() => setIsEdit(true)}
												>
													<EditIcon className="w-4 h-4 mr-2" />
													<span>수정</span>
												</DropdownMenuItem>
												<AlertDialogTrigger asChild>
													<DropdownMenuItem className="cursor-pointer">
														<TrashIcon className="w-4 h-4 mr-2" />
														<span>삭제</span>
													</DropdownMenuItem>
												</AlertDialogTrigger>
												<DropdownMenuSeparator />
											</>
										)}
										<DropdownMenuItem className="cursor-pointer">
											<FlagIcon className="w-4 h-4 mr-2" />
											<span>신고</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											정말로 글을 삭제하시겠습니까?
										</AlertDialogTitle>
										<AlertDialogDescription>
											삭제한 글은 복구할 수 없으며 답글 및 댓글 또한 모두
											삭제됩니다.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>취소</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDelete}
											className="bg-red-500 hover:bg-red-500/90"
										>
											삭제
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
						<div className="flex items-center justify-between">
							<CardDescription>
								{moment(discussion.cAt).fromNow()}
							</CardDescription>
							{!discussion.parent_id && (
								<div className="flex gap-2 items-center">
									<CardDescription>조회 {discussion.views}회</CardDescription>
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<MDEditor.Markdown source={discussion.content} />
						<div className="space-x-2 line-clamp-1 flex-1">
							{discussion.Tags.map((tag) => (
								<Badge className="p-2 rounded-lg text-blue-600 bg-blue-200 cursor-pointer hover:bg-blue-300 transition-all ease-in-out duration-200">
									{tag.name}
								</Badge>
							))}
						</div>
						<div className="flex justify-between items-center">
							<div className="">
								<ProfileCard
									name={discussion.User.name}
									image={discussion.User.image}
								/>
							</div>
							<Button
								variant="outline"
								className={cn(
									"flex items-center justify-between gap-2 text-md px-4 py-2 min-w-[80px]",
									liked && "text-red-500"
								)}
								onClick={() => onLike(discussion.id)}
							>
								<ThumbsUpIcon className="w-5 h-5" />
								{discussion.Likes?.length}
							</Button>
						</div>
						<div className="flex gap-2">
							<Button className="flex items-center gap-2" variant="ghost">
								<Share1Icon className="w-4 h-4" />
								공유
							</Button>
							<Button className="flex items-center gap-2" variant="ghost">
								<StarIcon className="w-4 h-4" />
								찜하기
							</Button>
							<Button
								className={cn(
									"flex items-center gap-2",
									openComments && "text-blue-500"
								)}
								variant="ghost"
								onClick={() => setOpenComments((open) => !open)}
							>
								<MessageSquareIcon className="w-4 h-4" />
								댓글 보기
							</Button>
						</div>
						<div className={cn(!openComments && "hidden", "mt-6")}>
							<Comments />
						</div>
					</CardContent>
				</>
			) : (
				<div className="p-4">
					<DiscussionForm
						initialData={{
							title: discussion.title,
							content: discussion.content,
							tags: discussion.Tags.map((tag) => tag.name),
						}}
						onSubmit={handleUpdate}
						onCancel={() => setIsEdit(false)}
					/>
				</div>
			)}
		</Card>
	);
}

export default DiscussionCard;
