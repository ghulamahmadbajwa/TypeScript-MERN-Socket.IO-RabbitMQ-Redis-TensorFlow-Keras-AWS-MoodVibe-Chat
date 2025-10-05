"use client";

import React, { useState } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

// Props expected from parent
interface MessageInputProps {
    selectedUser: string | null;                        // ID of the chat recipient
    message: string;                                    // Controlled input value
    setMessage: (message: string) => void;             // Updates message in parent state
    handleMessageSend: (e: any, imageFile?: File | null) => void; 
}

const MessageInput = ({ selectedUser, message, setMessage, handleMessageSend }: MessageInputProps) => {
    const [imageFile, setImageFile] = useState<File | null>(null); // Selected image file
    const [isUploading, setIsUploading] = useState(false);        // Upload status

    // Handle form submission
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!message.trim() && !imageFile) return; // Don't send empty messages

        setIsUploading(true);
        await handleMessageSend(e, imageFile);     // Pass image if any
        setIsUploading(false);

        // Clear inputs
        setMessage('');
        setImageFile(null);
    };

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImageFile(file);
    };

    // Remove selected image
    const handleRemoveImage = () => setImageFile(null);

    // Don't render if no chat is selected
    if (!selectedUser) return null;

    return (
        <form className="flex items-center gap-3 p-4 border-t border-[#A67B5B] bg-[#F5E6D3] shadow-md" onSubmit={handleSubmit} style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
            
            {/* Image Preview */}
            {imageFile && (
                <div className="relative w-14 h-14">
                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover rounded-lg border-2 border-[#A67B5B]" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1 bg-[#6B4E2E] rounded-full text-[#F5E6D3] hover:bg-[#A67B5B] transition-colors" disabled={isUploading}>
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Image Upload Button */}
            <label className={`p-2 rounded-full transition-colors ${isUploading ? 'bg-[#C9B79C] cursor-not-allowed' : 'bg-[#C9B79C] hover:bg-[#A67B5B] cursor-pointer shadow-sm'}`}>
                <ImageIcon className="w-5 h-5 text-[#6B4E2E]" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
            </label>

            {/* Text Input */}
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                className={`flex-1 py-2 px-4 bg-[#C9B79C] border border-[#A67B5B] rounded-lg text-[#2D2D2D] placeholder-[#2D2D2D] font-merriweather text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4E2E] ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUploading}
            />

            {/* Send Button */}
            <button type="submit" className={`p-2 rounded-full transition-colors ${isUploading ? 'bg-[#C9B79C] cursor-not-allowed' : 'bg-[#6B4E2E] hover:bg-[#A67B5B] text-[#F5E6D3] shadow-sm'}`} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-5 h-5 text-[#2D2D2D] animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
    );
};

export default MessageInput;