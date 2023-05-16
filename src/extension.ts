// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import axios from 'axios';

async function fetchCodeSuggestion(codeContext: String): Promise<string> {
	try {
		// const postUrl = "https://api.openai.com/v1/completions";
		const baseGetUrl = "https://data-exchange-uat-gbm.systems.uk.hsbc/oai.api.chat?msg=";
		const basePrompt = "Provide the best suggestion of code snippet based on comment given to you below. Your response SHOULD ONLY contains code and comments ! \n\n";
		// const body = {
		// 	model: "text-davinci-003",
		// 	prompt: basePrompt.concat(codeContext.toString()),
		// 	max_tokens: 1000,
		// 	n: 1,
		// 	temperature: 1.0
		// };
		// console.log(body);
		// const response = await axios.post(postUrl, body); // Replace with your API endpoint
		// console.log(response);
		const prompt = encodeURIComponent(basePrompt.concat(codeContext.toString()));
		const getUrl = baseGetUrl.concat(prompt);
		console.error('URL', getUrl);
		const response = await axios.get(getUrl); 
		// return response.data.choices[0].text as string; // Assuming the API response contains an string
		return response.data.result as string; // Assuming the API response contains an string
	} catch (error) {
		console.error('Error fetching code from the API:', error);
		return ""; // Return an empty string in case of an error
	}
  }

type DebounceFunction = <T extends any[], U>(func: (...args: T) => Promise<U>, delay: number) => (...args: T) => Promise<U>;

const debounce: DebounceFunction = <T extends any[], U>(func: (...args: T) => Promise<U>, delay: number) => {
let timeoutId: NodeJS.Timeout | null;

return (...args: T) => {
	clearTimeout(timeoutId as NodeJS.Timeout);

	return new Promise<U>((resolve) => {
	timeoutId = setTimeout(async () => {
		const result = await func(...args);
		resolve(result);
	}, delay);
	});
};
};

const debouncedfetchCodeSuggestion = debounce(fetchCodeSuggestion, 5000);


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('inline-completions demo started');
	vscode.commands.registerCommand('demo-ext.command1', async (...args) => {
		vscode.window.showInformationMessage('command1: ' + JSON.stringify(args));
	});

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, token, context) {
			console.log('provideInlineCompletionItems triggered');
			const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
			if (position.line <= 0) {
				return;
			}

			const result: vscode.InlineCompletionList = {
				items: [],
				commands: [],
			};
			
			let offset = 1;
			let counter = 0;
			while (offset > 0) {
				console.log("offset", offset);
				if (position.line - offset < 0) {
					break;
				}
				console.log(position.line);
				const lineBefore = document.lineAt(position.line - offset).text;
				console.log("lineBefore", lineBefore);
				// const matches = lineBefore.match(regexp);
				// console.log("matches", matches);
				// if (!matches) {
				// 	break;
				// }
				const text = (await fetchCodeSuggestion(lineBefore)).trim();
				if (text.length === 0) {
					break;
				} else {
					counter++;
				}
				console.log(text);
				offset += text.split(/\r\n|\r|\n/).length;
				let isSnippet = false;
				let completeBracketPairs = false;
				result.items.push({
					insertText: isSnippet ? new vscode.SnippetString(text) : text,
					range: new Range(position.line , 0, position.line, text.length),
					completeBracketPairs,
				});
			
				// const start = matches[1];
				// const startInt = parseInt(start, 10);
				// const end = matches[2];
				// const endInt =
				// 	end === '*'
				// 		? document.lineAt(position.line).text.length
				// 		: parseInt(end, 10);
				// const flags = matches[3];
				// const completeBracketPairs = flags.includes('b');
				// const isSnippet = flags.includes('s');
				// const text = matches[4].replace(/\\n/g, '\n');

				// result.items.push({
				// 	insertText: isSnippet ? new vscode.SnippetString(text) : text,
				// 	range: new Range(position.line + 1, 0, position.line+1, document.lineAt(position.line).text.length),
				// 	completeBracketPairs,
				// });

			}

			if (result.items.length > 0) {
				result.commands!.push({
					command: 'demo-ext.command1',
					title: 'My Inline Completion Demo Command',
					arguments: [1, 2],
				});
			}
			return result;
		},

		handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
			console.log('handleDidShowCompletionItem');
		},

		/**
		 * Is called when an inline completion item was accepted partially.
		 * @param acceptedLength The length of the substring of the inline completion that was accepted already.
		 */
		handleDidPartiallyAcceptCompletionItem(
			completionItem: vscode.InlineCompletionItem,
			acceptedLength: number
		): void {
			console.log('handleDidPartiallyAcceptCompletionItem');
		},
	};
	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
	// vscode.languages.registerCompletionItemProvider({ pattern: '**' }, provider);
}




