// Helper to generate the layout
import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import { marked } from "marked";
import type { AuthRequest } from "@cloudflare/workers-oauth-provider";
import { env } from "cloudflare:workers";

// This file mainly exists as a dumping ground for uninteresting html and CSS
// to remove clutter and noise from the auth logic. You likely do not need
// anything from this file.

export const layout = (content: HtmlEscapedString | string, title: string) => html`
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>${title}</title>
		</head>
		<body>
			<h1>Hello from Suite Genius</h1>
		</body>
	</html>
`;

export const homeContent = async (req: Request): Promise<HtmlEscapedString> => {
	// We have the README symlinked into the static directory, so we can fetch it
	// and render it into HTML
	const origin = new URL(req.url).origin;
	const res = await env.ASSETS.fetch(`${origin}/README.md`);
	const markdown = await res.text();
	const content = await marked(markdown);
	return html`
		<div class="max-w-4xl mx-auto markdown">${raw(content)}</div>
	`;
};

export const renderLoggedInAuthorizeScreen = async (
	oauthScopes: { name: string; description: string }[],
	oauthReqInfo: AuthRequest,
) => {
	return html`
		<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
			<h1 class="text-2xl font-heading font-bold mb-6 text-gray-900">
				Authorization Request
			</h1>

			<div class="mb-8">
				<h2 class="text-lg font-semibold mb-3 text-gray-800">
					MCP Remote Auth Demo would like permission to:
				</h2>
				<ul class="space-y-2">
					${oauthScopes.map(
						(scope) => html`
							<li class="flex items-start">
								<span
									class="inline-block mr-2 mt-1 text-secondary"
									>✓</span
								>
								<div>
									<p class="font-medium">${scope.name}</p>
									<p class="text-gray-600 text-sm">
										${scope.description}
									</p>
								</div>
							</li>
						`,
					)}
				</ul>
			</div>
			<form action="/approve" method="POST" class="space-y-4">
				<input
					type="hidden"
					name="oauthReqInfo"
					value="${JSON.stringify(oauthReqInfo)}"
				/>
				<input type="hidden" name="email" value="user@example.com" />
				<button
					type="submit"
					name="action"
					value="approve"
					class="w-full py-3 px-4 bg-secondary text-white rounded-md font-medium hover:bg-secondary/90 transition-colors"
				>
					Approve
				</button>
				<button
					type="submit"
					name="action"
					value="reject"
					class="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
				>
					Reject
				</button>
			</form>
		</div>
	`;
};

export const renderLoggedOutAuthorizeScreen = async (
	oauthScopes: { name: string; description: string }[],
	oauthReqInfo: AuthRequest,
) => {
	return html`
		<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
			<h1 class="text-2xl font-heading font-bold mb-6 text-gray-900">
				Authorization Request
			</h1>

			<div class="mb-8">
				<h2 class="text-lg font-semibold mb-3 text-gray-800">
					MCP Remote Auth Demo would like permission to:
				</h2>
				<ul class="space-y-2">
					${oauthScopes.map(
						(scope) => html`
							<li class="flex items-start">
								<span
									class="inline-block mr-2 mt-1 text-secondary"
									>✓</span
								>
								<div>
									<p class="font-medium">${scope.name}</p>
									<p class="text-gray-600 text-sm">
										${scope.description}
									</p>
								</div>
							</li>
						`,
					)}
				</ul>
			</div>
			<form action="/approve" method="POST" class="space-y-4">
				<input
					type="hidden"
					name="oauthReqInfo"
					value="${JSON.stringify(oauthReqInfo)}"
				/>
				<div class="space-y-4">
					<div>
						<label
							for="email"
							class="block text-sm font-medium text-gray-700 mb-1"
							>Email</label
						>
						<input
							type="email"
							id="email"
							name="email"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
						/>
					</div>
					<div>
						<label
							for="password"
							class="block text-sm font-medium text-gray-700 mb-1"
							>Password</label
						>
						<input
							type="password"
							id="password"
							name="password"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
						/>
					</div>
				</div>
				<button
					type="submit"
					name="action"
					value="login_approve"
					class="w-full py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
				>
					Log in and Approve
				</button>
				<button
					type="submit"
					name="action"
					value="reject"
					class="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
				>
					Reject
				</button>
			</form>
		</div>
	`;
};

export const renderApproveContent = async (
	message: string,
	status: string,
	redirectUrl: string,
) => {
	return html`
		<div
			class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center"
		>
			<div class="mb-4">
				<span
					class="inline-block p-3 ${
						status === "success"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					} rounded-full"
				>
					${status === "success" ? "✓" : "✗"}
				</span>
			</div>
			<h1 class="text-2xl font-heading font-bold mb-4 text-gray-900">
				${message}
			</h1>
			<p class="mb-8 text-gray-600">
				You will be redirected back to the application shortly.
			</p>
			<a
				href="/"
				class="inline-block py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
			>
				Return to Home
			</a>
			${raw(`
				<script>
					setTimeout(() => {
						window.location.href = "${redirectUrl}";
					}, 2000);
				</script>
			`)}
		</div>
	`;
};

export const renderAuthorizationApprovedContent = async (redirectUrl: string) => {
	return renderApproveContent("Authorization approved!", "success", redirectUrl);
};

export const renderAuthorizationRejectedContent = async (redirectUrl: string) => {
	return renderApproveContent("Authorization rejected.", "error", redirectUrl);
};

export const parseApproveFormBody = async (body: {
	[x: string]: string | File;
}) => {
	const action = body.action as string;
	const email = body.email as string;
	const password = body.password as string;
	let oauthReqInfo: AuthRequest | null = null;
	try {
		oauthReqInfo = JSON.parse(body.oauthReqInfo as string) as AuthRequest;
	} catch (e) {
		oauthReqInfo = null;
	}

	return { action, oauthReqInfo, email, password };
};
