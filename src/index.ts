import * as path from 'path';
import * as yargs from 'yargs';
import LinqPadRunner, { CommandResponse } from './linqpad-runner';

const programFiles = (process.env['ProgramFiles(x86)'] || process.env['ProgramFiles']) as string;
const linqPadPath = path.join(programFiles, 'LinqPad5', 'lprun.exe');

const linqpad = new LinqPadRunner(linqPadPath);

async function listenForInput(): Promise<string> {
	return new Promise<string>(resolve => {
		const stdin = process.openStdin();
		const buffer: string[] = [];

		stdin.addListener('data', (data: Buffer) => {
			const input = data.toString().trim();
			buffer.push(input);

			if (input === '' && buffer[buffer.length - 1] === '') {
				stdin.end();
				resolve(buffer.join('\n'));
			}
		});
	});
}

export = async function execute(): Promise<void> {
	const argv = yargs
		.boolean('statements')
		.boolean('program')
		.alias('s', 'statements')
		.alias('p', 'program')
		.argv;

	let input: string;
	if (argv.statements || argv.program) {
		input = await listenForInput();
	} else {
		input = argv._.join(' ');
	}

	console.log('Executing...');

	let response: CommandResponse;
	if (argv.statements) {
		response = await linqpad.runStatements(input);
	} else if (argv.program) {
		response = await linqpad.runProgram(input);
	} else {
		response = await linqpad.runExpression(input);
	}

	if (response.success) {
		console.log(response.output);
	} else {
		console.error(response.output);
	}
}
