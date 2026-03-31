-- =============================================
-- NURSLY — Migration 005: Atomic Applicant Selection
-- =============================================

create or replace function public.select_shift_applicant(
  p_shift_id  uuid,
  p_nurse_id  uuid,
  p_actor_id  uuid
) returns jsonb language plpgsql security definer as $$
declare
  v_shift       public.shifts%rowtype;
  v_application public.shift_applications%rowtype;
begin
  select * into v_shift from public.shifts where id = p_shift_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Shift not found.');
  end if;
  if v_shift.status != 'open' then
    return jsonb_build_object('success', false, 'error',
      format('Shift is not open (status: %s)', v_shift.status));
  end if;
  select * into v_application from public.shift_applications
    where shift_id = p_shift_id and nurse_id = p_nurse_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Application not found.');
  end if;
  if v_application.status not in ('pending', 'shortlisted') then
    return jsonb_build_object('success', false, 'error',
      format('Application not selectable (status: %s)', v_application.status));
  end if;
  update public.shift_applications
    set status = 'rejected', updated_at = now()
    where shift_id = p_shift_id and nurse_id != p_nurse_id
    and status in ('pending', 'shortlisted');
  update public.shift_applications
    set status = 'selected', updated_at = now()
    where shift_id = p_shift_id and nurse_id = p_nurse_id;
  update public.shifts
    set status = 'filled', filled_by = p_nurse_id, filled_at = now(), updated_at = now()
    where id = p_shift_id;
  insert into public.audit_events (actor_id, actor_role, action, entity_type, entity_id, metadata)
    values (p_actor_id, 'employer_admin', 'shift.filled', 'shift', p_shift_id,
            jsonb_build_object('nurse_id', p_nurse_id));
  return jsonb_build_object('success', true);
exception when others then
  return jsonb_build_object('success', false, 'error', 'Selection failed. Please try again.');
end; $$;

grant execute on function public.select_shift_applicant(uuid, uuid, uuid) to authenticated;
