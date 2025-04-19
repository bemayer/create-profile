import { useEffect, useRef, useState } from "preact/hooks";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import { User } from "../types.ts";

interface ProfileEditorProps {
  user: User;
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const editorContainer = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
     // import EditorJS from "@editorjs/editorjs" is not working
     // Getting error: Uncaught (in promise) ReferenceError: Element is not defined
    script.src = 'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest';
    script.async = true;
    script.onload = () => {
      let bioData = { blocks: [] };
      try {
        bioData = JSON.parse(user.bio || '{"blocks":[]}');
      } catch (e) {
        console.error('Error parsing bio data:', e);
      }

      const editor = new (window as any).EditorJS({
        holder: editorContainer.current,
        tools: {
          header: {
            class: Header,
            inlineToolbar: ['link']
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true
          }
        },
        data: bioData
      });

      setEditorInstance(editor);
    };
    document.head.appendChild(script);

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
      document.head.removeChild(script);
    };
  }, [user.bio]);

  const saveProfile = async () => {
    if (!editorInstance) return;

    try {
      setIsSaving(true);
      setMessage(null);

      const editorData = await editorInstance.save();

      const response = await fetch('/editor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          bio: JSON.stringify(editorData),
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ text: 'Profile saved successfully!', type: 'success' });
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({
        text: `Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Bio
        </label>
        <div ref={editorContainer} class="border border-gray-300 rounded p-4 min-h-[200px]"></div>
      </div>

      {message && (
        <div class={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div class="flex items-center justify-between">
        <button
          type="button"
          class={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={saveProfile}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
