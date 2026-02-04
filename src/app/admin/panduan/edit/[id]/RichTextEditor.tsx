'use client'

import { Editor } from '@tinymce/tinymce-react'

export default function RichTextEditor({ 
  name, 
  defaultValue = '',
  required = false,
  editorRef
}: { 
  name: string
  defaultValue?: string
  required?: boolean
  editorRef: any
}) {
  return (
    <>
      <Editor
        apiKey="cdh53v2rbq0ungvvdau8at50jcwsnqh4omwm1hhqpcwex17l"
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={defaultValue}
        init={{
          height: 500,
          menubar: true,
          skin: 'oxide-dark',
          content_css: 'dark',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; background-color: #0A0A0A; color: #E5E5E5; }',
        }}
      />
      <input
        type="hidden"
        name={name}
        required={required}
      />
    </>
  )
}