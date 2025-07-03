// 'use server';
//
// export async function logVirtualBoxEvent(message: string, type: 'info' | 'error' | 'success' = 'info') {
//   try {
//     const response = await fetch('https://ardua.site:444/api/virtualbox/logs', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json; charset=utf-8' },
//       body: JSON.stringify({ message, type }),
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error: ${response.status}`);
//     }
//     return { success: true };
//   } catch (err) {
//     console.error(`[VirtualBox Server] ERROR: Failed to log - ${String(err)}`);
//     throw err;
//   }
// }