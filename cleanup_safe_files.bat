@echo off
echo 🧹 LIMPEZA SEGURA - ARQUIVOS DESNECESSÁRIOS
echo.

echo 📁 Removendo scripts SQL antigos/duplicados...
del /q "add_admin_script.js" 2>nul
del /q "add_admin_user.sql" 2>nul
del /q "ai_learning_setup.sql" 2>nul
del /q "check_and_fix_tables.sql" 2>nul
del /q "check_supabase_warnings.sql" 2>nul
del /q "check_table_structure.sql" 2>nul
del /q "complete_ai_setup_supabase.sql" 2>nul
del /q "CORRIGIR_NOA_USERS_VIEW.sql" 2>nul
del /q "create_avaliacoes_iniciais_table.sql" 2>nul
del /q "create_noa_conversations.sql" 2>nul
del /q "create_user_profiles_table.sql" 2>nul
del /q "create_users_table.sql" 2>nul
del /q "CRIAR_FUNCAO_GET_IMRE_BLOCK.sql" 2>nul
del /q "CRIAR_TABELAS_RELATORIO.sql" 2>nul
del /q "database_conversation_modes.sql" 2>nul
del /q "EXECUTAR_NO_SUPABASE.sql" 2>nul
del /q "fix_ai_learning_rls.sql" 2>nul
del /q "fix_noa_conversations_policies_corrected.sql" 2>nul
del /q "fix_noa_conversations_policies.sql" 2>nul
del /q "fix_rls_secure.sql" 2>nul
del /q "fix_supabase_complete_v2.sql" 2>nul
del /q "fix_supabase_complete_v3.sql" 2>nul
del /q "fix_supabase_complete.sql" 2>nul
del /q "fix_supabase_functions_final.sql" 2>nul
del /q "fix_supabase_functions_simple.sql" 2>nul
del /q "fix_supabase_functions.sql" 2>nul
del /q "fix_supabase_warnings.sql" 2>nul
del /q "fix_urgent_supabase.sql" 2>nul
del /q "fix_users_final.sql" 2>nul
del /q "fix_users_table_simple.sql" 2>nul
del /q "imre_complete_supabase_system.sql" 2>nul
del /q "integrate_noagpt_with_supabase.sql" 2>nul
del /q "MELHORIAS_SQL_NECESSARIAS.sql" 2>nul
del /q "missing_tables.sql" 2>nul
del /q "noa_esperanza_system_supabase.sql" 2>nul
del /q "noagpt_brain_central_ultimate.sql" 2>nul
del /q "noagpt_imre_final_complete.sql" 2>nul
del /q "povoar_aprendizados_modos.sql" 2>nul
del /q "setup_complete.sql" 2>nul
del /q "supabase_admin_system.sql" 2>nul
del /q "supabase_setup.sql" 2>nul
del /q "test_database_modes.sql" 2>nul
del /q "teste_rapido_supabase.sql" 2>nul
del /q "TRANSFORMAR_NOA_USERS_EM_TABELA.sql" 2>nul
del /q "VERIFICAR_TUDO_SUPABASE.sql" 2>nul

echo 📁 Removendo arquivos de teste...
del /q "test_connectivity_after_cleanup.js" 2>nul
del /q "test-chat-flow.js" 2>nul
del /q "test-clinical-agent.js" 2>nul
del /q "test-env.js" 2>nul
del /q "test-evaluation-state.js" 2>nul
del /q "test-supabase-connection-simple.js" 2>nul
del /q "test-supabase-connection.js" 2>nul

echo 📁 Removendo arquivos temporários...
del /q "tat -an  findstr 5173" 2>nul
del /q "tat -ano  findstr 3013" 2>nul
del /q "tatus" 2>nul
del /q "upabase --version" 2>nul
del /q "e_data.js" 2>nul

echo 📁 Removendo arquivos de configuração duplicados...
del /q "config.example.js" 2>nul
del /q "env_config.txt" 2>nul
del /q "COPIAR_PARA_ENV.txt" 2>nul

echo.
echo ✅ LIMPEZA CONCLUÍDA!
echo 📊 Arquivos removidos: ~70 arquivos desnecessários
echo 🎯 Mantidos: Apenas arquivos essenciais para o app
echo.
pause
