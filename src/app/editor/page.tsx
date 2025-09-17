// FILE: app/editor/page.tsx
"use client";


import React from "react";
import PostEditor from "../components/PostEditor";


export default function EditorPage() {
return (
<div className="min-h-screen bg-gray-50 p-6">
<div className="max-w-3xl mx-auto">
<h1 className="text-2xl font-bold mb-4">Create / Edit Post</h1>
<PostEditor />
</div>
</div>
);
}