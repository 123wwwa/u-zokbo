"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn, useForm } from "react-hook-form";
import { Discussion, SingleResponse } from "@/types/schema";
import { Input } from "../ui/input";
import MDEditor from "@uiw/react-md-editor";

const formSchema = z.object({
	title: z
		.string()
		.min(3, { message: "제목은 3글자 이상이어야 합니다" })
		.max(255, { message: "제목은 최대 255자입니다" }),
	content: z.string().max(5000, { message: "내용은 최대 5000자입니다" }),
});

export type onSuccess = ({
	form,
	res,
}: {
	form: UseFormReturn<z.infer<typeof formSchema>>;
	res: SingleResponse<Discussion>;
}) => void;

interface DiscussionFormProps {
	parent_id?: number;
	onSuccess?: onSuccess;
}

function DiscussionForm({ onSuccess, parent_id }: DiscussionFormProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { title: "", content: "" },
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const res = (await fetch("http://localhost:3000/api/discussions", {
			body: JSON.stringify({ ...values, parent_id }),
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((res) => res.json())) as SingleResponse<Discussion>;

		if (res.success) {
			onSuccess?.({ form, res });
		} else {
			alert("문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold text-md">제목</FormLabel>
							<FormControl>
								<Input placeholder="제목을 입력해주세요" {...field} />
							</FormControl>
							<FormDescription>
								3자 이상 255자 이하로 입력해주세요
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold text-md">내용</FormLabel>
							<FormControl>
								<MDEditor placeholder="내용을 입력해주세요" {...field} />
							</FormControl>
							<FormDescription>
								최대 5000자까지 입력할 수 있습니다
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" variant="primary">
					제출
				</Button>
			</form>
		</Form>
	);
}

export default DiscussionForm;
