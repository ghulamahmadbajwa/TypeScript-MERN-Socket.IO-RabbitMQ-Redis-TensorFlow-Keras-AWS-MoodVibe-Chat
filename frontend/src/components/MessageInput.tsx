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
        <form className="flex items-center gap-2 p-3 border-t border-gray-700 bg-gray-900" onSubmit={handleSubmit}>
            
            {/* Image Preview */}
            {imageFile && (
                <div className="relative w-16 h-16">
                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700" disabled={isUploading}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image Upload Button */}
            <label className={`p-2 rounded-lg transition-colors ${isUploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'}`}>
                <ImageIcon className="w-5 h-5 text-gray-300" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
            </label>

            {/* Text Input */}
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUploading}
            />

            {/* Send Button */}
            <button type="submit" className={`p-2 rounded-lg transition-colors ${isUploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-5 h-5 text-gray-300 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
    );
};

export default MessageInput;
