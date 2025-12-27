import { z } from 'zod';

export const cheatSheetSchema = z.object({
    title: z.string().describe('The title of the cheat sheet, e.g., "Python Regex"'),
    description: z.string().describe('A brief description of the topic'),
    sections: z.array(z.object({
        title: z.string().describe('Section title, e.g., "Basic Syntax"'),
        items: z.array(z.object({
            label: z.string().describe('The command or key concept, e.g., "re.search()"'),
            value: z.string().describe('The code snippet or explanation'),
            description: z.string().optional().describe('Short context if needed')
        }))
    }))
});
