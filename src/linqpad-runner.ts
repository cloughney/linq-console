import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

export interface CommandResponse {
	output: string;
	success: boolean;
}

export interface RunOptions {
	includes?: string[];
}

enum RunType {
	expression,
	statements,
	program
}

export default class LinqPadRunner {
	public constructor(private exePath: string) { }

	/**
	 * Runs a single expression and returns the response.
	 */
	public async runExpression(input: string, options?: RunOptions): Promise<CommandResponse> {
		options = options || {};
		return await this.executeCommand(RunType.expression, input);
	}

	/**
	 * Runs several inline expressions and returns the response, if any.
	 */
	public async runStatements(input: string, options?: RunOptions): Promise<CommandResponse> {
		options = options || {};
		return await this.executeCommand(RunType.statements, input);
	}

	/**
	 * Runs a program and returns the response, if any.
	 */
	public async runProgram(input: string, options?: RunOptions): Promise<CommandResponse> {
		options = options || {};
		return await this.executeCommand(RunType.program, input);
	}

	private createScriptFile(script: string): Promise<string> {
		return new Promise<string>(resolve => {
			const filePath = path.join(
				process.env['TEMP'] as string,
				`linqpad-console.${Date.now()}.txt`);

			fs.writeFile(filePath, script, err => {
				if (err) throw err;
				resolve(filePath);
			});
		});
	}

	private destroyScriptFile(filePath: string): Promise<void> {
		return new Promise<void>(resolve => {
			fs.unlink(filePath, err => {
				if (err) throw err;
				resolve();
			});
		});
	}

	private executeCommand(runType: RunType, input: string): Promise<CommandResponse> {
		return new Promise<CommandResponse>(async resolve => {
			const filePath = await this.createScriptFile(input);

			const langArg = this.resolveLangArgument(runType);
			const lprun = spawn(this.exePath, [langArg, filePath]);
			const buffer: (string|Buffer)[] = [];

			lprun.stdout.on('data', data => { buffer.push(data); });
			lprun.stderr.on('data', data => { buffer.push(data); });
			lprun.on('close', async code => {
				await this.destroyScriptFile(filePath);

				resolve({
					output: buffer.join(''),
					success: code === 0
				});
			});
		});
	}

	private resolveLangArgument(runType: RunType): string {
		switch (runType) {
			case RunType.expression: return '-lang=e';
			case RunType.statements: return '-lang=s';
			case RunType.program: return '-lang=p';
			default: throw new Error('Cannot resolve run type.');
		}
	}
}
