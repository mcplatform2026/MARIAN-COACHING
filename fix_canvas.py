import re

with open('src/components/SignatureCanvasBlock.tsx', 'r') as f:
    content = f.read()

# Instead of using react-signature-canvas, we can write a simple hook-based canvas drawing.
